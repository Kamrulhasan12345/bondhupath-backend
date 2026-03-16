import { boolean, index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "../users/users.schema";

export const sessions = pgTable("sessions", {
  jti: uuid("jti").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  };
});

export const otpTokens = pgTable("otp_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false).notNull(),
  attemptCount: smallint("attempt_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index("otp_tokens_email_idx").on(table.email),
  };
});
