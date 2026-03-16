import Elysia from "elysia";
import { authn } from "./authn.middleware";
import { db } from "../db/database";
import { users } from "../modules/users/users.schema";
import { eq } from "drizzle-orm";

export const authz = new Elysia({ name: "authz.middlware" })
  .use(authn)
  .macro("authz", {
    authn: true,
    resolve: async ({ user: { userId }, request, set }) => {
      const userObj = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!userObj) return set.status = 401, { error: 'INVALID_CREDENTIALS', message: 'User not found.' };

      if (userObj[0].accountStatus === 'suspended')
        return set.status = 403, { error: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended. Contact support for more information.' };

      const { passwordHash, ...user } = userObj[0];
      return { userObj: user } as const;
    }
  })
