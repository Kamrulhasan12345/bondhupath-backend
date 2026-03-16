import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["male", "female"]);
export const roleEnum = pgEnum("role", ['student', 'teacher', 'staff'])
export const departmentEnum = pgEnum("department", ["CSE", "EEE", "BME", "ME", "MME", "IPE", "WRE", "NAME", "CE", "URP", "CHE", "NCE", "PMRE", "CHEM", "MATH", "PHYS", "HUM", "ARCH"])
export const accountStatusEnum = pgEnum("account_status", ["pending_verification", "verified", "suspended"])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  gender: genderEnum("gender").notNull(),
  role: roleEnum("role").notNull(),
  buetId: text("buet_id").unique().notNull(),
  department: departmentEnum("department").notNull(),
  accountStatus: accountStatusEnum("account_status")
    .notNull()
    .default("verified"),
  // TODO: setup email verification flow and change default account status to "pending_verification"
  consentLog: jsonb("consent_log"),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
