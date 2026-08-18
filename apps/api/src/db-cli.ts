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

/** Apply ordered SQL files once and record their filename-derived version. */
async function applyDirectory(kind:"migrate"|"seed"):Promise<void>{
  const directory=resolve(root,kind==="migrate"?"db/migrations":"db/seeds");
  const historyTable=kind==="migrate"?"schema_migrations":"seed_history";
  if(kind==="seed"&&!(await tableExists(historyTable)))throw new Error("seed_history is missing; run migrations before seeds");
  const applied=new Set<string>();
  if(await tableExists(historyTable)){
    const result=await pool.query<{version:string}>(`SELECT version FROM ${historyTable}`);
    for(const row of result.rows)applied.add(row.version);
  }
  const files=(await readdir(directory)).filter((file)=>file.endsWith(".sql")).sort();
  for(const file of files){
    const version=file.replace(/\.sql$/u,"");
    if(applied.has(version)){console.log(`${kind}: ${file} (already applied)`);continue}
    console.log(`${kind}: ${file}`);
    await pool.query(await readFile(resolve(directory,file),"utf8"));
    if(!(await tableExists(historyTable)))throw new Error(`${file} completed without creating ${historyTable}`);
    await pool.query(`INSERT INTO ${historyTable}(version) VALUES ($1) ON CONFLICT DO NOTHING`,[version]);
    applied.add(version);
  }
}

try {
  if(mode==="migrate"||mode==="bootstrap")await applyDirectory("migrate");
  if(mode==="seed"||mode==="bootstrap")await applyDirectory("seed");
} finally { await pool.end(); }
