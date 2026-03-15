import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '../../.env.local' });

type Row = {
  schemaname: string;
  tablename: string;
  indexname: string;
  access_method: string;
  is_constraint: boolean;
  is_unique: boolean;
  is_primary: boolean;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  bytes: number;
  size: string;
};

function parseArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatBool(value: boolean): string {
  return value ? 'yes' : 'no';
}

function padRight(value: string, width: number): string {
  if (value.length >= width) return value;
  return value + ' '.repeat(width - value.length);
}

function formatTable(rows: Row[]): string {
  const headers = [
    'schema',
    'table',
    'index',
    'am',
    'size',
    'scans',
    'constraint',
    'unique',
    'primary',
  ] as const;

  const cells = rows.map((r) => ({
    schema: r.schemaname,
    table: r.tablename,
    index: r.indexname,
    am: r.access_method,
    size: r.size,
    scans: String(r.idx_scan),
    constraint: formatBool(r.is_constraint),
    unique: formatBool(r.is_unique),
    primary: formatBool(r.is_primary),
  }));

  const widths = Object.fromEntries(
    headers.map((h) => [h, Math.max(h.length, ...cells.map((c) => c[h].length))]),
  ) as Record<(typeof headers)[number], number>;

  const lines: string[] = [];
  lines.push(headers.map((h) => padRight(h, widths[h])).join('  '));
  lines.push(headers.map((h) => '-'.repeat(widths[h])).join('  '));
  for (const c of cells) {
    lines.push(headers.map((h) => padRight(c[h], widths[h])).join('  '));
  }
  return lines.join('\n');
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set (expected in .env.local)');
  }

  const schema = parseArg('schema'); // e.g. public
  const onlyUnused = hasFlag('only-unused');
  const minBytes = toInt(parseArg('min-bytes'), 0);
  const limit = toInt(parseArg('limit'), 200);

  const sql = neon(url);

  const where: string[] = [];
  const params: unknown[] = [];
  if (schema) {
    params.push(schema);
    where.push(`ns.nspname = $${params.length}`);
  }
  if (onlyUnused) where.push(`s.idx_scan = 0`);
  if (minBytes > 0) {
    params.push(minBytes);
    where.push(`pg_relation_size(idx.oid) >= $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const query = `
    SELECT
      ns.nspname::text AS schemaname,
      rel.relname::text AS tablename,
      idx.relname::text AS indexname,
      am.amname::text AS access_method,
      EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = idx.oid) AS is_constraint,
      i.indisunique AS is_unique,
      i.indisprimary AS is_primary,
      s.idx_scan::bigint AS idx_scan,
      s.idx_tup_read::bigint AS idx_tup_read,
      s.idx_tup_fetch::bigint AS idx_tup_fetch,
      pg_relation_size(idx.oid)::bigint AS bytes,
      pg_size_pretty(pg_relation_size(idx.oid))::text AS size
    FROM pg_stat_user_indexes s
    JOIN pg_index i ON i.indexrelid = s.indexrelid
    JOIN pg_class idx ON idx.oid = s.indexrelid
    JOIN pg_class rel ON rel.oid = s.relid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    JOIN pg_am am ON am.oid = idx.relam
    ${whereSql}
    ORDER BY
      (EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = idx.oid)) DESC,
      pg_relation_size(idx.oid) DESC,
      s.idx_scan ASC
    LIMIT ${limit};
  `;

  const result = await sql.query(query, params);
  const rows = (result as any).rows as Row[];

  if (!rows?.length) {
    console.log('No indexes matched filters.');
    return;
  }

  console.log(formatTable(rows));

  const dropCandidates = rows.filter(
    (r) =>
      r.idx_scan === 0 &&
      !r.is_constraint &&
      !r.is_unique &&
      !r.is_primary &&
      r.bytes >= minBytes,
  );

  if (dropCandidates.length) {
    console.log('\nDrop candidates (review carefully; stats can reset):');
    for (const r of dropCandidates) {
      console.log(`- DROP INDEX CONCURRENTLY IF EXISTS "${r.schemaname}"."${r.indexname}"; -- ${r.size} on ${r.schemaname}.${r.tablename}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
