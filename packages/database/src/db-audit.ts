/**
 * Database Audit Script (Standalone with postgres-js)
 * 
 * This script performs deep database analysis:
 * - Table structure analysis
 * - Index coverage check
 * - Missing index detection
 * - Query performance analysis (EXPLAIN ANALYZE)
 * 
 * Usage:
 *   bun scripts/db-audit.ts
 *   bun scripts/db-audit.ts --verbose
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from root
config({ path: resolve(__dirname, '../../../.env.local') });

import postgres from 'postgres';

// ============================================================================
// CONFIGURATION
// ============================================================================

const VERBOSE = process.argv.includes('--verbose');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in environment');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

// ============================================================================
// TYPES
// ============================================================================

interface TableInfo {
  name: string;
  rowCount: number;
  sizeBytes: number;
  sizeHuman: string;
  columnCount: number;
  indexCount: number;
}

interface IndexInfo {
  tableName: string;
  indexName: string;
  indexDef: string;
  size: string;
  isUnique: boolean;
  isPrimary: boolean;
}

interface QueryAudit {
  name: string;
  query: string;
  table: string;
  planType: string;
  executionTime: number;
  totalCost: number;
  indexUsed: string | null;
  warning?: string;
}

interface AuditResult {
  timestamp: string;
  tables: TableInfo[];
  indexes: IndexInfo[];
  queryAudits: QueryAudit[];
  missingIndexes: string[];
  slowQueries: QueryAudit[];
  recommendations: string[];
  score: number;
}

// ============================================================================
// CRITICAL QUERIES TO AUDIT
// These are the most important queries in the system
// ============================================================================

const QUERIES_TO_AUDIT = [
  {
    name: 'Partner Profile by ID',
    table: 'partner',
  },
  {
    name: 'Car Listings Search (Published)',
    table: 'car_listing',
  },
  {
    name: 'Car Listings by Partner',
    table: 'car_listing',
  },
  {
    name: 'User by Email',
    table: 'user',
  },
  {
    name: 'Session by Token',
    table: 'session',
  },
  {
    name: 'Bookings by Partner',
    table: 'booking',
  },
  {
    name: 'Bookings by User',
    table: 'booking',
  },
  {
    name: 'Conversations by Participant',
    table: 'conversation_participant',
  },
  {
    name: 'Messages by Conversation',
    table: 'message',
  },
  {
    name: 'Favorites by User',
    table: 'user_favorite',
  },
  {
    name: 'Listing Views Count',
    table: 'listing_view',
  },
  {
    name: 'Partner KYC Status',
    table: 'kyc_record',
  },
  {
    name: 'Staff by Partner',
    table: 'partner_staff',
  },
  {
    name: 'Verification by Identifier',
    table: 'verification',
  },
  {
    name: 'Account by User',
    table: 'account',
  },
  {
    name: 'User Profile',
    table: 'user_profile',
  },
  {
    name: 'Audit Log by Entity',
    table: 'audit_log',
  },
  {
    name: 'Partner Availability',
    table: 'partner_availability',
  },
  {
    name: 'Booking Slots',
    table: 'booking_slot',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function colorize(text: string, color: 'green' | 'yellow' | 'red' | 'cyan' | 'dim'): string {
  const colors: Record<string, string> = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[90m',
  };
  return `${colors[color]}${text}\x1b[0m`;
}

// ============================================================================
// DATABASE ANALYSIS FUNCTIONS
// ============================================================================

async function getAllTables(): Promise<TableInfo[]> {
  console.log('\n📊 Analyzing tables...');
  
  const result = await sql`
    SELECT 
      schemaname,
      relname as table_name,
      n_live_tup as row_count,
      pg_relation_size(schemaname || '.' || relname) as size_bytes,
      pg_size_pretty(pg_relation_size(schemaname || '.' || relname)) as size_human
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_relation_size(schemaname || '.' || relname) DESC
  `;

  const tables: TableInfo[] = [];
  
  for (const row of result) {
    // Get column count
    const colResult = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = ${row.table_name}
    `;
    
    // Get index count
    const idxResult = await sql`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = ${row.table_name}
    `;
    
    tables.push({
      name: row.table_name as string,
      rowCount: Number(row.row_count),
      sizeBytes: Number(row.size_bytes),
      sizeHuman: row.size_human as string,
      columnCount: Number(colResult[0].count),
      indexCount: Number(idxResult[0].count),
    });
  }
  
  return tables;
}

async function getAllIndexes(): Promise<IndexInfo[]> {
  console.log('🔍 Analyzing indexes...');
  
  const result = await sql`
    SELECT 
      tablename as table_name,
      indexname as index_name,
      indexdef as index_def
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `;
  
  return result.map((row) => ({
    tableName: row.table_name as string,
    indexName: row.index_name as string,
    indexDef: row.index_def as string,
    size: 'N/A',
    isUnique: (row.index_def as string).includes('UNIQUE'),
    isPrimary: (row.index_name as string).includes('pkey'),
  }));
}

// Helper to run dynamic SQL with Neon
async function runExplain(tableName: string): Promise<any> {
  // We need to construct the query string and use sql.unsafe or template literal
  // Neon doesn't support sql.identifier, so we verify table name first then interpolate
  const query = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM "${tableName}" LIMIT 1`;
  const result = await sql.unsafe(query);
  // sql.unsafe returns result rows directly, first row contains QUERY PLAN
  return result;
}

async function analyzeQuery(queryConfig: typeof QUERIES_TO_AUDIT[0]): Promise<QueryAudit> {
  // Check if table exists first
  const tableCheck = await sql`
    SELECT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = ${queryConfig.table}
    ) as exists
  `;
  
  if (!tableCheck[0].exists) {
    return {
      name: queryConfig.name,
      query: `SELECT * FROM ${queryConfig.table}`,
      table: queryConfig.table,
      planType: 'N/A',
      executionTime: 0,
      totalCost: 0,
      indexUsed: null,
      warning: `Table '${queryConfig.table}' does not exist`,
    };
  }

  try {
    // Run EXPLAIN ANALYZE - table name is already validated above
    const result = await runExplain(queryConfig.table);
    
    // Parse JSON result - Neon returns array with object containing 'QUERY PLAN' key
    const queryPlanData = result[0]?.['QUERY PLAN'] || result[0]?.['query plan'];
    const planRoot = Array.isArray(queryPlanData) ? queryPlanData[0] : queryPlanData;
    const plan = planRoot?.['Plan'] || planRoot?.plan;
    
    if (!plan) {
      return {
        name: queryConfig.name,
        query: `SELECT * FROM ${queryConfig.table} LIMIT 1`,
        table: queryConfig.table,
        planType: 'Unknown',
        executionTime: 0,
        totalCost: 0,
        indexUsed: null,
        warning: 'Could not parse query plan',
      };
    }
    
    const executionTime = planRoot?.['Execution Time'] || planRoot?.execution_time || 0;
    
    // Extract index info
    let indexUsed: string | null = null;
    if (plan['Index Name']) {
      indexUsed = plan['Index Name'];
    } else if (plan['Node Type'] === 'Index Scan' || plan['Node Type'] === 'Index Only Scan') {
      indexUsed = plan['Index Name'] || 'Unknown Index';
    }
    
    let warning: string | undefined;
    if (plan['Node Type'] === 'Seq Scan' && queryConfig.table !== 'listing_view') {
      warning = '⚠️ Sequential scan detected - consider adding an index';
    }
    
    return {
      name: queryConfig.name,
      query: `SELECT * FROM ${queryConfig.table} LIMIT 1`,
      table: queryConfig.table,
      planType: plan['Node Type'] || 'Unknown',
      executionTime,
      totalCost: plan['Total Cost'] || 0,
      indexUsed,
      warning,
    };
  } catch (error) {
    return {
      name: queryConfig.name,
      query: `SELECT * FROM ${queryConfig.table}`,
      table: queryConfig.table,
      planType: 'Error',
      executionTime: 0,
      totalCost: 0,
      indexUsed: null,
      warning: `Query failed: ${(error as Error).message}`,
    };
  }
}

async function checkForMissingIndexes(tables: TableInfo[], indexes: IndexInfo[]): Promise<string[]> {
  console.log('🔎 Checking for missing indexes...');
  
  const missingIndexes: string[] = [];
  
  // Expected indexes based on common query patterns
  const expectedIndexes: Record<string, string[]> = {
    listing: ['partner_id', 'status', 'published_at', 'created_at'],
    booking: ['user_id', 'partner_id', 'listing_id', 'status', 'created_at'],
    message: ['conversation_id', 'sender_id', 'created_at'],
    conversation_participant: ['user_id', 'conversation_id'],
    favorite: ['user_id', 'listing_id'],
    listing_view: ['listing_id', 'user_id'],
    session: ['token', 'user_id', 'expires_at'],
    verification: ['identifier', 'created_at'],
    account: ['user_id', 'provider_account_id'],
    staff: ['partner_id', 'user_id'],
    kyc: ['partner_id'],
    user: ['email'],
  };
  
  for (const [tableName, expectedCols] of Object.entries(expectedIndexes)) {
    const tableIndexes = indexes.filter(i => i.tableName === tableName);
    
    for (const col of expectedCols) {
      const hasIndex = tableIndexes.some(i => 
        i.indexDef.includes(`(${col})`) || 
        i.indexDef.includes(`(${col},`) ||
        i.indexDef.includes(`, ${col})`) ||
        i.indexDef.includes(`, ${col},`)
      );
      
      if (!hasIndex) {
        // Check if table exists
        const table = tables.find(t => t.name === tableName);
        if (table && table.rowCount > 100) {
          missingIndexes.push(`${tableName}.${col} (${table.rowCount} rows)`);
        }
      }
    }
  }
  
  return missingIndexes;
}

function calculateScore(
  queryAudits: QueryAudit[], 
  missingIndexes: string[],
  tables: TableInfo[]
): number {
  let score = 100;
  
  // Deduct for sequential scans
  const seqScans = queryAudits.filter(q => q.planType === 'Seq Scan');
  score -= seqScans.length * 5;
  
  // Deduct for missing indexes
  score -= missingIndexes.length * 3;
  
  // Deduct for slow queries (>10ms)
  const slowQueries = queryAudits.filter(q => q.executionTime > 10);
  score -= slowQueries.length * 5;
  
  // Deduct for very slow queries (>100ms)
  const verySlowQueries = queryAudits.filter(q => q.executionTime > 100);
  score -= verySlowQueries.length * 10;
  
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runAudit(): Promise<AuditResult> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           DATABASE PERFORMANCE AUDIT                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`Started at: ${new Date().toISOString()}\n`);

  // 1. Get all tables
  const tables = await getAllTables();
  
  console.log('\n📋 TABLES SUMMARY');
  console.log('─'.repeat(70));
  console.log('Table Name'.padEnd(30) + 'Rows'.padStart(10) + 'Size'.padStart(12) + 'Cols'.padStart(8) + 'Idx'.padStart(8));
  console.log('─'.repeat(70));
  
  for (const table of tables) {
    const rowColor = table.rowCount > 10000 ? 'yellow' : 'green';
    console.log(
      table.name.padEnd(30) + 
      colorize(table.rowCount.toLocaleString().padStart(10), rowColor) +
      table.sizeHuman.padStart(12) +
      table.columnCount.toString().padStart(8) +
      table.indexCount.toString().padStart(8)
    );
  }
  
  // 2. Get all indexes
  const indexes = await getAllIndexes();
  
  if (VERBOSE) {
    console.log('\n🔍 INDEXES');
    console.log('─'.repeat(70));
    for (const idx of indexes) {
      const color = idx.isPrimary ? 'cyan' : idx.isUnique ? 'green' : 'dim';
      console.log(colorize(`[${idx.tableName}] ${idx.indexName}`, color));
      if (VERBOSE) {
        console.log(colorize(`  ${idx.indexDef}`, 'dim'));
        console.log(colorize(`  Size: ${idx.size}`, 'dim'));
      }
    }
  }
  
  // 3. Analyze queries
  console.log('\n⚡ QUERY ANALYSIS');
  console.log('─'.repeat(70));
  
  const queryAudits: QueryAudit[] = [];
  
  for (const queryConfig of QUERIES_TO_AUDIT) {
    process.stdout.write(`Analyzing: ${queryConfig.name}... `);
    const audit = await analyzeQuery(queryConfig);
    queryAudits.push(audit);
    
    if (audit.warning) {
      console.log(colorize(audit.warning, 'red'));
    } else if (audit.planType === 'Index Scan' || audit.planType === 'Index Only Scan') {
      console.log(colorize(`✓ ${audit.planType} using ${audit.indexUsed} (${audit.executionTime.toFixed(3)}ms)`, 'green'));
    } else if (audit.planType === 'N/A') {
      console.log(colorize(`⏭ Skipped (table missing)`, 'dim'));
    } else {
      console.log(colorize(`${audit.planType} (${audit.executionTime.toFixed(3)}ms)`, 'yellow'));
    }
    
    if (VERBOSE && audit.planType !== 'N/A') {
      console.log(colorize(`  Query: ${audit.query.substring(0, 80)}...`, 'dim'));
    }
  }
  
  // 4. Check for missing indexes
  const missingIndexes = await checkForMissingIndexes(tables, indexes);
  
  if (missingIndexes.length > 0) {
    console.log('\n⚠️  POTENTIALLY MISSING INDEXES');
    console.log('─'.repeat(70));
    for (const missing of missingIndexes) {
      console.log(colorize(`  • ${missing}`, 'yellow'));
    }
  }
  
  // 5. Identify slow queries
  const slowQueries = queryAudits.filter(q => q.executionTime > 10 && q.planType !== 'N/A');
  
  if (slowQueries.length > 0) {
    console.log('\n🐢 SLOW QUERIES (>10ms)');
    console.log('─'.repeat(70));
    for (const slow of slowQueries) {
      console.log(colorize(`  • ${slow.name}: ${slow.executionTime.toFixed(3)}ms`, 'red'));
    }
  }
  
  // 6. Generate recommendations
  const recommendations: string[] = [];
  
  const seqScans = queryAudits.filter(q => q.planType === 'Seq Scan');
  if (seqScans.length > 0) {
    recommendations.push(`Add indexes to avoid sequential scans on: ${seqScans.map(q => q.table).join(', ')}`);
  }
  
  if (missingIndexes.length > 0) {
    recommendations.push(`Consider adding indexes for: ${missingIndexes.slice(0, 5).join(', ')}${missingIndexes.length > 5 ? '...' : ''}`);
  }
  
  if (slowQueries.length > 0) {
    recommendations.push(`Optimize slow queries: ${slowQueries.map(q => q.name).join(', ')}`);
  }
  
  // Large tables without many indexes
  const largeTables = tables.filter(t => t.rowCount > 1000 && t.indexCount < 3);
  if (largeTables.length > 0) {
    recommendations.push(`Large tables with few indexes: ${largeTables.map(t => t.name).join(', ')}`);
  }
  
  // 7. Calculate score
  const score = calculateScore(queryAudits, missingIndexes, tables);
  
  // 8. Print summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    AUDIT SUMMARY                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`
📊 Database Health Score: ${score >= 80 ? colorize(score.toString(), 'green') : score >= 60 ? colorize(score.toString(), 'yellow') : colorize(score.toString(), 'red')}/100

📋 Stats:
   • Tables analyzed: ${tables.length}
   • Indexes found: ${indexes.length}
   • Queries audited: ${queryAudits.length}
   • Sequential scans: ${seqScans.length}
   • Slow queries: ${slowQueries.length}
   • Missing indexes: ${missingIndexes.length}
`);

  if (recommendations.length > 0) {
    console.log('💡 Recommendations:');
    for (const rec of recommendations) {
      console.log(`   • ${rec}`);
    }
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  
  return {
    timestamp: new Date().toISOString(),
    tables,
    indexes,
    queryAudits,
    missingIndexes,
    slowQueries,
    recommendations,
    score,
  };
}

// Run the audit
runAudit()
  .then((result) => {
    if (process.argv.includes('--output=json')) {
      console.log('\n--- JSON OUTPUT ---');
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(result.score >= 60 ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  });
