import { SQL } from "bun";
import config from "../config/config";
import { drizzle } from "drizzle-orm/bun-sql";

export const client = new SQL({
  max: config.db.maxConnections,
  idleTimeout: config.db.idleTimeoutInS,
  maxLifetime: config.db.maxLifetimeInS,
  connectionTimeout: config.db.connectionTimeoutInS,
});

export const db = drizzle({ client })
