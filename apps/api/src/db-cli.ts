import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";
import { parseConfig } from "./config.js";

const mode = process.argv[2];
if (mode !== "migrate" && mode !== "seed" && mode !== "bootstrap") throw new Error("Usage: db-cli.ts migrate|seed|bootstrap");
const root = process.env.ATLAS_PROJECT_ROOT ? resolve(process.env.ATLAS_PROJECT_ROOT) : resolve(import.meta.dirname, "../../../");
const pool = new pg.Pool({ connectionString: parseConfig(process.env).DATABASE_URL });

async function tableExists(table:string):Promise<boolean>{
  const result=await pool.query<{name:string|null}>("SELECT to_regclass($1)::text AS name",[`public.${table}`]);
  return result.rows[0]?.name!==null;
}

async function columnExists(table:string,column:string):Promise<boolean>{
  const result=await pool.query<{n:string}>(
    "SELECT count(*)::text AS n FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2",
    [table,column]);
  return result.rows[0]?.n!=="0";
}

/**
 * Apply ordered SQL files and record that they ran.
 *
 * Migrations are recorded by filename and never replayed — a schema change is
 * not re-runnable. Seeds are recorded by content: every seed is written with
 * ON CONFLICT DO UPDATE, so an edited seed must run again, otherwise an
 * existing database silently keeps the old rows while a fresh one gets the new
 * ones (migration 005 records the case that forced this).
 */
async function applyDirectory(kind:"migrate"|"seed"):Promise<void>{
  const directory=resolve(root,kind==="migrate"?"db/migrations":"db/seeds");
  const historyTable=kind==="migrate"?"schema_migrations":"seed_history";
  if(kind==="seed"&&!(await tableExists(historyTable)))throw new Error("seed_history is missing; run migrations before seeds");
  const tracksChecksum=kind==="seed"&&await columnExists(historyTable,"checksum_sha256");
  const applied=new Map<string,string|null>();
  if(await tableExists(historyTable)){
    const result=await pool.query<{version:string;checksum_sha256?:string|null}>(
      tracksChecksum?`SELECT version, checksum_sha256 FROM ${historyTable}`:`SELECT version FROM ${historyTable}`);
    for(const row of result.rows)applied.set(row.version,row.checksum_sha256??null);
  }
  const files=(await readdir(directory)).filter((file)=>file.endsWith(".sql")).sort();
  for(const file of files){
    const version=file.replace(/\.sql$/u,"");
    const body=await readFile(resolve(directory,file),"utf8");
    const checksum=createHash("sha256").update(body).digest("hex");
    if(applied.has(version)){
      if(!tracksChecksum||applied.get(version)===checksum){console.log(`${kind}: ${file} (already applied)`);continue}
      console.log(`${kind}: ${file} (content changed, replaying)`);
    } else console.log(`${kind}: ${file}`);
    await pool.query(body);
    if(!(await tableExists(historyTable)))throw new Error(`${file} completed without creating ${historyTable}`);
    if(tracksChecksum||await columnExists(historyTable,"checksum_sha256")){
      await pool.query(`INSERT INTO ${historyTable}(version,checksum_sha256) VALUES ($1,$2)
        ON CONFLICT (version) DO UPDATE SET checksum_sha256=EXCLUDED.checksum_sha256, applied_at=now()`,[version,checksum]);
    } else await pool.query(`INSERT INTO ${historyTable}(version) VALUES ($1) ON CONFLICT DO NOTHING`,[version]);
    applied.set(version,checksum);
  }
}

try {
  if(mode==="migrate"||mode==="bootstrap")await applyDirectory("migrate");
  if(mode==="seed"||mode==="bootstrap")await applyDirectory("seed");
} finally { await pool.end(); }
