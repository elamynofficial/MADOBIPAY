import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrapDb, closeDb, getEngine, isEmbedded, pool } from '../db.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../../sql');

async function main() {
  if (isEmbedded()) {
    await bootstrapDb();
  } else {
    await pool.query('SELECT 1 AS ok');
    console.log('connected to Supabase pooler');
    await pool.exec(readFileSync(join(root, 'schema.sql'), 'utf8'));
    console.log('applied schema.sql');
    await pool.exec(readFileSync(join(root, 'seed.sql'), 'utf8'));
    console.log('applied seed.sql');
    console.log(`migrate complete (${getEngine()})`);
  }
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
