import { config as loadEnv } from 'dotenv';
import dns from 'node:dns';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import type { PGlite } from '@electric-sql/pglite';

dns.setDefaultResultOrder('ipv4first');

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv({ path: join(apiRoot, '.env') });

export type QueryResult<T> = { rows: T[]; rowCount: number };

export type SqlClient = {
  query: <T = Record<string, unknown>>(text: string, values?: unknown[]) => Promise<QueryResult<T>>;
};

function postgresUrl() {
  return (process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? '').trim();
}

function hasPostgresUrl() {
  return /^postgres(ql)?:\/\//i.test(postgresUrl());
}

export function isEmbedded() {
  return !hasPostgresUrl() && process.env.PG_EMBEDDED?.toLowerCase() === 'true';
}

export const useEmbedded = {
  valueOf() {
    return isEmbedded();
  },
  [Symbol.toPrimitive]() {
    return isEmbedded();
  },
} as unknown as boolean;

export function getEngine(): 'pglite' | 'postgres' {
  return isEmbedded() ? 'pglite' : 'postgres';
}

export const engine: 'pglite' | 'postgres' = getEngine();

function adaptSql(sql: string) {
  return sql
    .replace(/CREATE EXTENSION IF NOT EXISTS ["']?pgcrypto["']?;/gi, '')
    .replace(/CREATE EXTENSION IF NOT EXISTS ["']?citext["']?;/gi, '')
    .replace(/DO \$\$ BEGIN CREATE EXTENSION IF NOT EXISTS pgcrypto; EXCEPTION WHEN OTHERS THEN NULL; END \$\$;/gi, '')
    .replace(/DO \$\$ BEGIN CREATE EXTENSION IF NOT EXISTS citext; EXCEPTION WHEN OTHERS THEN NULL; END \$\$;/gi, '')
    .replace(/\bCITEXT\b/gi, 'TEXT')
    .replace(/\bINET\b/gi, 'TEXT');
}

function mapResult<T>(res: { rows: unknown[]; affectedRows?: number; rowCount?: number | null }): QueryResult<T> {
  return { rows: res.rows as T[], rowCount: res.affectedRows ?? res.rowCount ?? res.rows.length };
}

function pgConfig(raw: string, port: number): pg.PoolConfig {
  const u = new URL(raw.replace(/^postgres(ql)?:/i, 'http:'));
  return {
    host: u.hostname,
    port,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent((u.pathname || '/postgres').replace(/^\//, '') || 'postgres'),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 10_000,
    keepAlive: true,
    max: 4,
  };
}

async function ping(cfg: pg.PoolConfig) {
  const client = new pg.Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    ssl: cfg.ssl,
    connectionTimeoutMillis: cfg.connectionTimeoutMillis,
  });
  try {
    await client.connect();
    await client.query('SELECT 1 AS ok');
  } finally {
    await client.end().catch(() => undefined);
  }
}

let pgPool: pg.Pool | null = null;
let lite: PGlite | null = null;
let ready: Promise<void> | null = null;

async function open(): Promise<void> {
  const url = postgresUrl();
  if (!hasPostgresUrl() && process.env.PG_EMBEDDED?.toLowerCase() === 'false') {
    throw new Error(
      'DATABASE_URL is missing or invalid. Use DATABASE_URL=postgresql://... (equals sign, not a colon).',
    );
  }
  if (isEmbedded()) {
    const { PGlite } = await import('@electric-sql/pglite');
    const dir = join(apiRoot, 'data/pglite');
    mkdirSync(dir, { recursive: true });
    try {
      lite = new PGlite(dir);
      await lite.waitReady;
    } catch {
      try {
        rmSync(dir, { recursive: true, force: true });
        mkdirSync(dir, { recursive: true });
        lite = new PGlite(dir);
        await lite.waitReady;
      } catch {
        lite = new PGlite();
        await lite.waitReady;
        console.warn('PGlite disk store failed; using in-memory DB for this process');
      }
    }
    return;
  }
  if (!hasPostgresUrl()) {
    throw new Error(
      'DATABASE_URL is missing. Create a project at https://supabase.com, copy Connect → Session pooler, set DATABASE_URL=postgresql://...',
    );
  }
  const parsed = new URL(url.replace(/^postgres(ql)?:/i, 'http:'));
  const preferred = Number(parsed.port || 6543);
  const ports = [...new Set([preferred, 6543, 5432])];
  let lastErr: unknown;
  for (const port of ports) {
    const cfg = pgConfig(url, port);
    try {
      console.log(`Supabase: trying ${cfg.host}:${port} user=${cfg.user}`);
      await ping(cfg);
      pgPool = new pg.Pool(cfg);
      console.log(`Supabase: connected ${cfg.host}:${port}`);
      return;
    } catch (err) {
      lastErr = err;
      const code = err instanceof Error && 'code' in err ? String((err as { code?: string }).code) : '';
      console.warn(`Supabase: ${cfg.host}:${port} failed (${code || (err instanceof Error ? err.message : err)})`);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('Could not connect to Supabase pooler on 5432 or 6543');
}

export function ensureDb(): Promise<void> {
  if (!ready) ready = open();
  return ready;
}

export const pool: SqlClient & { end: () => Promise<void>; exec: (sql: string) => Promise<void> } = {
  query: async <T>(text: string, values?: unknown[]) => {
    await ensureDb();
    if (lite) {
      const res = values?.length ? await lite.query(text, values) : await lite.query(text);
      return mapResult<T>(res);
    }
    const res = values ? await pgPool!.query(text, values) : await pgPool!.query(text);
    return mapResult<T>(res);
  },
  exec: async (sql: string) => {
    await ensureDb();
    const text = isEmbedded() ? adaptSql(sql) : sql;
    if (lite) {
      await lite.exec(text);
      return;
    }
    await pgPool!.query(text);
  },
  end: async () => {
    if (lite) await lite.close();
    if (pgPool) await pgPool.end();
  },
};

export async function withTx<T>(fn: (client: SqlClient) => Promise<T>): Promise<T> {
  await ensureDb();
  if (lite) {
    return lite.transaction(async (tx) => {
      const client: SqlClient = {
        query: async <R>(text: string, values?: unknown[]) => {
          const res = values?.length ? await tx.query(text, values) : await tx.query(text);
          return mapResult<R>(res);
        },
      };
      return fn(client);
    });
  }
  const client = await pgPool!.connect();
  try {
    await client.query('BEGIN');
    const wrapped: SqlClient = {
      query: async <R>(text: string, values?: unknown[]) => {
        const res = values ? await client.query(text, values) : await client.query(text);
        return mapResult<R>(res);
      },
    };
    const result = await fn(wrapped);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function bootstrapDb() {
  await ensureDb();
  if (!isEmbedded()) {
    const host = process.env.SUPABASE_URL ? 'supabase' : 'postgres';
    console.log(`MADOBIPAY DB engine: ${host} (DATABASE_URL)`);
    return;
  }
  const sqlRoot = join(apiRoot, '../../sql');
  const tables = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') AS exists`,
  );
  const exists = tables.rows[0]?.exists;
  if (!exists || exists === false) {
    await pool.exec(readFileSync(join(sqlRoot, 'schema.sql'), 'utf8'));
    await pool.exec(readFileSync(join(sqlRoot, 'seed.sql'), 'utf8'));
  }
  const { seedDemo } = await import('./scripts/seed.js');
  await seedDemo();
  console.log('MADOBIPAY DB engine: pglite (fallback — set DATABASE_URL for Supabase)');
}

export async function closeDb() {
  await pool.end();
}
