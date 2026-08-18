import { createApp } from "./app.js";
import { parseConfig } from "./config.js";
import { createPool } from "./db.js";

try {
  const config = parseConfig(process.env);
  const pool = createPool(config);
  const server = createApp(pool).listen(config.API_PORT, () => console.log(`Shanhaijing Atlas API listening on ${config.API_PORT}`));
  const shutdown = async () => { server.close(); await pool.end(); };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
} catch (error) {
  console.error("API startup failed", error);
  process.exitCode = 1;
}

