import { z } from "zod";

const ConfigSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
});

export type Config = z.infer<typeof ConfigSchema>;

/** Parse process configuration and fail loudly on invalid or missing values. */
export function parseConfig(env: NodeJS.ProcessEnv): Config {
  return ConfigSchema.parse(env);
}

