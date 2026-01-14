/**
 * Query Pattern Audit - N+1 and Bad Pattern Detection
 * 
 * Scans the codebase for:
 * - N+1 query patterns (queries inside loops)
 * - SELECT * usage (should use explicit columns)
 * - Unbounded queries (missing LIMIT)
 * - Missing indexes on WHERE/JOIN columns
 * - Sequential queries that could be batched
 * - Inefficient patterns
 * 
 * Usage:
 *   cd packages/database && bun src/query-pattern-audit.ts
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface PatternIssue {
  file: string;
  line: number;
  pattern: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  code: string;
  suggestion?: string;
}

interface FileAnalysis {
  file: string;
  issues: PatternIssue[];
  queryCount: number;
}

interface AuditResult {
  timestamp: string;
  filesScanned: number;
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  files: FileAnalysis[];
  summary: Record<string, number>;
}

// ============================================================================
// PATTERN DEFINITIONS
// ============================================================================

const PATTERNS = {
  // N+1 Patterns - queries inside loops
  N_PLUS_ONE_FOR: {
    // for loop with await inside
    regex: /for\s*\([^)]*\)\s*\{[^}]*await\s+(?:db\.|sql|query|execute|select|findFirst|findMany|findUnique)/gis,
    severity: 'critical' as const,
    message: 'Potential N+1 query: Database query inside for loop',
    suggestion: 'Batch queries using IN clause or fetch all data before the loop',
  },
  N_PLUS_ONE_FOREACH: {
    regex: /\.forEach\s*\(\s*async[^)]*\)\s*=>\s*\{[^}]*await\s+(?:db\.|sql|query|execute)/gis,
    severity: 'critical' as const,
    message: 'N+1 query: Async database query inside forEach',
    suggestion: 'Use Promise.all with map or batch query',
  },
  N_PLUS_ONE_MAP: {
    regex: /\.map\s*\(\s*async[^)]*=>[^}]*await\s+(?:db\.|sql|query|execute|select|findFirst)/gis,
    severity: 'warning' as const,
    message: 'Potential N+1: Async query in map (check if Promise.all is used)',
    suggestion: 'Ensure results are awaited with Promise.all',
  },
  N_PLUS_ONE_WHILE: {
    regex: /while\s*\([^)]*\)\s*\{[^}]*await\s+(?:db\.|sql|query|execute)/gis,
    severity: 'critical' as const,
    message: 'N+1 query: Database query inside while loop',
    suggestion: 'Refactor to use batch query or cursor-based pagination',
  },

  // SELECT * patterns
  SELECT_STAR: {
    regex: /select\s*\(\s*\)\s*\.from|SELECT\s+\*\s+FROM|\.findMany\s*\(\s*\)|\.findFirst\s*\(\s*\)/gi,
    severity: 'warning' as const,
    message: 'SELECT * or no column specification - fetching all columns',
    suggestion: 'Specify exact columns needed to reduce data transfer',
  },

  // Unbounded queries
  NO_LIMIT: {
    regex: /\.findMany\s*\(\s*\{(?![^}]*(?:take|limit))[^}]*\}\s*\)|select\([^)]*\)\.from\([^)]*\)(?!.*(?:\.limit|LIMIT))/gi,
    severity: 'warning' as const,
    message: 'Query without LIMIT - could fetch unlimited rows',
    suggestion: 'Add .limit() or take: to prevent unbounded result sets',
  },

  // Missing WHERE on large tables
  FULL_TABLE_SCAN: {
    regex: /from\s*\(\s*(?:carListing|listing|listingView|auditLog|message)\s*\)(?![^;]*where)/gi,
    severity: 'warning' as const,
    message: 'Query on large table without WHERE clause',
    suggestion: 'Add WHERE clause to filter results',
  },

  // Sequential queries that could be parallel
  SEQUENTIAL_AWAITS: {
    regex: /const\s+\w+\s*=\s*await[^;]+;\s*const\s+\w+\s*=\s*await[^;]+;\s*const\s+\w+\s*=\s*await/gi,
    severity: 'info' as const,
    message: 'Multiple sequential awaits - could potentially run in parallel',
    suggestion: 'Consider Promise.all() if queries are independent',
  },

  // Nested queries (suboptimal)
  NESTED_QUERY: {
    regex: /await\s+db\.[^;]*\(\s*await\s+db\./gi,
    severity: 'warning' as const,
    message: 'Nested database queries - consider JOIN or batch query',
    suggestion: 'Use JOIN or fetch data in single query with relations',
  },

  // String concatenation in queries (SQL injection risk)
  STRING_CONCAT_QUERY: {
    regex: /(?:execute|query|sql)\s*\(\s*[`"'][^`"']*\$\{(?!sql)/gi,
    severity: 'critical' as const,
    message: 'String interpolation in SQL query - potential SQL injection',
    suggestion: 'Use parameterized queries with sql`` template literal',
  },

  // OrderBy without index hint
  ORDER_BY_COMPLEX: {
    regex: /orderBy\s*:\s*\[\s*\{[^}]*\}\s*,\s*\{/gi,
    severity: 'info' as const,
    message: 'Complex ORDER BY with multiple columns',
    suggestion: 'Ensure composite index exists for this column combination',
  },

  // Inefficient OR conditions
  MULTIPLE_OR: {
    regex: /or\s*\(\s*(?:[^)]*,\s*){3,}/gi,
    severity: 'info' as const,
    message: 'Multiple OR conditions - may prevent index usage',
    suggestion: 'Consider using IN clause or UNION for better performance',
  },

  // Count without optimization
  COUNT_STAR: {
    regex: /COUNT\s*\(\s*\*\s*\)|\.count\s*\(\s*\)/gi,
    severity: 'info' as const,
    message: 'COUNT(*) query - can be slow on large tables',
    suggestion: 'Consider caching counts or using approximate counts',
  },

  // Missing transaction for multiple writes
  MULTIPLE_INSERTS: {
    regex: /await\s+db\.insert[^;]+;\s*await\s+db\.insert/gi,
    severity: 'warning' as const,
    message: 'Multiple inserts without transaction',
    suggestion: 'Wrap in db.transaction() for atomicity and performance',
  },

  // Delete without WHERE
  DELETE_NO_WHERE: {
    regex: /\.delete\s*\(\s*(?:carListing|partner|user|booking)\s*\)(?![^;]*where)/gi,
    severity: 'critical' as const,
    message: 'DELETE without WHERE clause - will delete all rows!',
    suggestion: 'Always add WHERE clause to DELETE statements',
  },

  // Update without WHERE
  UPDATE_NO_WHERE: {
    regex: /\.update\s*\(\s*(?:carListing|partner|user|booking)\s*\)\.set\s*\([^)]*\)(?![^;]*where)/gi,
    severity: 'critical' as const,
    message: 'UPDATE without WHERE clause - will update all rows!',
    suggestion: 'Always add WHERE clause to UPDATE statements',
  },

  // LIKE with leading wildcard
  LIKE_LEADING_WILDCARD: {
    regex: /(?:like|ilike)\s*\(\s*[^,]+,\s*[`"']%/gi,
    severity: 'warning' as const,
    message: 'LIKE with leading wildcard prevents index usage',
    suggestion: 'Use full-text search or restructure query',
  },

  // Fetching then filtering in JS
  FETCH_THEN_FILTER: {
    regex: /(?:findMany|select)[^;]+\)(?:\s*\.\s*then)?\s*[;\n][^;]*\.filter\s*\(/gi,
    severity: 'warning' as const,
    message: 'Fetching data then filtering in JavaScript',
    suggestion: 'Move filter logic to WHERE clause in database',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function colorize(text: string, color: 'red' | 'yellow' | 'green' | 'cyan' | 'dim'): string {
  const colors: Record<string, string> = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    dim: '\x1b[90m',
  };
  return `${colors[color]}${text}\x1b[0m`;
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return colorize('CRITICAL', 'red');
    case 'warning': return colorize('WARNING', 'yellow');
    case 'info': return colorize('INFO', 'cyan');
    default: return severity;
  }
}

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function getCodeSnippet(content: string, index: number, matchLength: number): string {
  const lines = content.split('\n');
  const lineNum = getLineNumber(content, index);
  const startLine = Math.max(0, lineNum - 2);
  const endLine = Math.min(lines.length, lineNum + 2);
  return lines.slice(startLine, endLine).join('\n').substring(0, 200);
}

// ============================================================================
// FILE SCANNING
// ============================================================================

async function getAllTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(currentDir: string) {
    try {
      const entries = await readdir(currentDir);
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        
        // Skip node_modules, .git, etc.
        if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === '.next') {
          continue;
        }
        
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await scan(fullPath);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          // Focus on files likely to contain queries
          if (
            entry.includes('query') ||
            entry.includes('queries') ||
            entry.includes('route') ||
            entry.includes('action') ||
            entry.includes('service') ||
            entry.includes('repository') ||
            entry.includes('api') ||
            fullPath.includes('/queries/') ||
            fullPath.includes('/api/') ||
            fullPath.includes('/actions/')
          ) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await scan(dir);
  return files;
}

// ============================================================================
// ANALYSIS
// ============================================================================

async function analyzeFile(filePath: string, rootDir: string): Promise<FileAnalysis> {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = relative(rootDir, filePath);
  const issues: PatternIssue[] = [];
  let queryCount = 0;
  
  // Count queries in file
  const queryPatterns = [
    /db\./g,
    /sql`/g,
    /\.findMany/g,
    /\.findFirst/g,
    /\.findUnique/g,
    /\.create\(/g,
    /\.update\(/g,
    /\.delete\(/g,
    /\.select\(/g,
    /\.insert\(/g,
    /execute\(/g,
  ];
  
  for (const pattern of queryPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      queryCount += matches.length;
    }
  }
  
  // Skip files with no queries
  if (queryCount === 0) {
    return { file: relativePath, issues: [], queryCount: 0 };
  }
  
  // Check each pattern
  for (const [patternName, patternConfig] of Object.entries(PATTERNS)) {
    const regex = new RegExp(patternConfig.regex.source, patternConfig.regex.flags);
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const line = getLineNumber(content, match.index);
      const code = getCodeSnippet(content, match.index, match[0].length);
      
      issues.push({
        file: relativePath,
        line,
        pattern: patternName,
        severity: patternConfig.severity,
        message: patternConfig.message,
        code: match[0].substring(0, 100) + (match[0].length > 100 ? '...' : ''),
        suggestion: patternConfig.suggestion,
      });
    }
  }
  
  // Additional N+1 detection: look for queries that fetch IDs then query each
  const idFetchPattern = /const\s+(\w+)\s*=\s*await[^;]+(?:select|map)\s*\([^)]*id[^)]*\)[^;]*;[^]*?for\s*\([^)]*\1/gi;
  let idMatch;
  while ((idMatch = idFetchPattern.exec(content)) !== null) {
    issues.push({
      file: relativePath,
      line: getLineNumber(content, idMatch.index),
      pattern: 'N_PLUS_ONE_ID_FETCH',
      severity: 'critical',
      message: 'N+1 pattern: Fetching IDs then querying each in a loop',
      code: idMatch[0].substring(0, 100),
      suggestion: 'Use a single query with IN clause or JOIN',
    });
  }
  
  return { file: relativePath, issues, queryCount };
}

// ============================================================================
// MAIN
// ============================================================================

async function runAudit(): Promise<AuditResult> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         QUERY PATTERN AUDIT - N+1 & BAD PATTERNS              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  // Scan from workspace root
  const rootDir = join(__dirname, '../../..');
  console.log(`📂 Scanning from: ${rootDir}\n`);
  
  const files = await getAllTypeScriptFiles(rootDir);
  console.log(`📄 Found ${files.length} files to analyze\n`);
  
  const analyses: FileAnalysis[] = [];
  let totalQueries = 0;
  
  for (const file of files) {
    const analysis = await analyzeFile(file, rootDir);
    if (analysis.queryCount > 0) {
      analyses.push(analysis);
      totalQueries += analysis.queryCount;
    }
  }
  
  // Filter to files with issues
  const filesWithIssues = analyses.filter(a => a.issues.length > 0);
  
  // Count by severity
  const allIssues = filesWithIssues.flatMap(a => a.issues);
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.severity === 'info').length;
  
  // Count by pattern
  const summary: Record<string, number> = {};
  for (const issue of allIssues) {
    summary[issue.pattern] = (summary[issue.pattern] || 0) + 1;
  }
  
  // Print results
  console.log('─'.repeat(70));
  console.log('📊 SCAN RESULTS');
  console.log('─'.repeat(70));
  console.log(`Files with queries: ${analyses.length}`);
  console.log(`Total query operations: ${totalQueries}`);
  console.log(`Files with issues: ${filesWithIssues.length}`);
  console.log();
  
  if (allIssues.length === 0) {
    console.log(colorize('✅ No issues found! Your queries look clean.', 'green'));
  } else {
    // Print issues grouped by file
    for (const analysis of filesWithIssues) {
      console.log(`\n📄 ${colorize(analysis.file, 'cyan')} (${analysis.issues.length} issues)`);
      console.log('─'.repeat(50));
      
      for (const issue of analysis.issues) {
        console.log(`  Line ${issue.line}: ${severityColor(issue.severity)}`);
        console.log(`  ${issue.message}`);
        console.log(colorize(`  Code: ${issue.code}`, 'dim'));
        if (issue.suggestion) {
          console.log(colorize(`  💡 ${issue.suggestion}`, 'green'));
        }
        console.log();
      }
    }
    
    // Print summary
    console.log('\n' + '═'.repeat(70));
    console.log('📈 SUMMARY');
    console.log('═'.repeat(70));
    console.log(`
Total Issues: ${allIssues.length}
  ${colorize(`🔴 Critical: ${criticalCount}`, criticalCount > 0 ? 'red' : 'dim')}
  ${colorize(`🟡 Warnings: ${warningCount}`, warningCount > 0 ? 'yellow' : 'dim')}
  ${colorize(`🔵 Info: ${infoCount}`, infoCount > 0 ? 'cyan' : 'dim')}
`);
    
    console.log('Issues by Pattern:');
    for (const [pattern, count] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
      const patternConfig = PATTERNS[pattern as keyof typeof PATTERNS];
      const severity = patternConfig?.severity || 'info';
      const color = severity === 'critical' ? 'red' : severity === 'warning' ? 'yellow' : 'cyan';
      console.log(`  ${colorize(pattern, color)}: ${count}`);
    }
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  
  return {
    timestamp: new Date().toISOString(),
    filesScanned: analyses.length,
    totalIssues: allIssues.length,
    criticalCount,
    warningCount,
    infoCount,
    files: filesWithIssues,
    summary,
  };
}

// Run
runAudit()
  .then((result) => {
    const exitCode = result.criticalCount > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
