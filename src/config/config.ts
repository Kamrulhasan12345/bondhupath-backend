import { z } from "zod";
import ms from "ms";
import logger from "../utils/logger";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "./constant";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  POSTGRES_URL: z.string().url(),
  MAX_CONNECTIONS: z.number().default(20),
  IDLE_TIMEOUT_IN_S: z.number().default(300),
  MAX_LIFETIME_IN_S: z.number().default(3600),
  CONNECTION_TIMEOUT_IN_S: z.number().default(10),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  logger.error({ error: parsed.error.issues }, "ENV_CONFIG_ERR");
  process.exit(1);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  server: {
    port: parseInt(env.PORT, 10),
  },
  auth: {
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessTokenExp: ACCESS_TOKEN_EXP,
      refreshTokenExp: REFRESH_TOKEN_EXP,
      accessTokenExpInMs: ms(ACCESS_TOKEN_EXP),
      refreshTokenExpInMs: ms(REFRESH_TOKEN_EXP),
      issuer: 'bondhupath-backend',
      audience: 'bondhupath-client'
    }
  },
  db: {
    url: env.POSTGRES_URL,
    maxConnections: env.MAX_CONNECTIONS,
    idleTimeoutInS: env.IDLE_TIMEOUT_IN_S,
    maxLifetimeInS: env.MAX_LIFETIME_IN_S,
    connectionTimeoutInS: env.CONNECTION_TIMEOUT_IN_S,
  }
} as const;

export type Config = typeof config;
export default config;
