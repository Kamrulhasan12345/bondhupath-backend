import Elysia from "elysia";
import { authn, refreshJwt } from "../../middlewares/authn.middleware";
import z from "zod";
import { loginRequestBodySchema, registerRequestBodySchema } from "./authn.interface";
import { BUET_EMAIL_REGEX } from "../../config/constant";
import { db } from "../../db/database";
import { users } from "../users/users.schema";
import { and, eq } from "drizzle-orm";
import { sessions } from "./authn.schema";
import config from "../../config/config";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authn)
  .use(refreshJwt)
  .post("/login", async ({ request, body, set, accessJwt, refreshJwt }) => {
    const userObj = await db.select().from(users).where(eq(users.buetId, body.buet_id)).limit(1);

    if (userObj.length === 0) {
      await new Promise(r => setTimeout(r, 300)); // timing equalization
      return set.status = 401, { error: 'INVALID_CREDENTIALS' };
    }

    const user = userObj[0];


    if (user.accountStatus === 'pending_verification')
      return set.status = 403, { error: 'NOT_VERIFIED', redirect: '/verify' };

    if (user.accountStatus === 'suspended')
      return set.status = 403, { error: 'ACCOUNT_SUSPENDED' };

    const passwordMatch = await Bun.password.verify(body.password, user.passwordHash);

    if (!passwordMatch)
      return set.status = 401, { error: 'INVALID_CREDENTIALS' };

    // ── Access token ───────────────────────────────────────────────
    const accessToken = await accessJwt.sign({
      sub: user.id,
      email: user.email,
      buet_id: user.buetId,
      role: user.role,
      gender: user.gender,
    });

    // ── Refresh token with fresh jti ───────────────────────────────
    const jti = crypto.randomUUID();

    const refreshToken = await refreshJwt.sign({
      jti,
      sub: user.id,
    });

    const session: typeof sessions.$inferInsert = {
      jti: jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + config.auth.jwt.refreshTokenExpInMs)
    }

    await db.insert(sessions).values(session);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in_ms: config.auth.jwt.accessTokenExpInMs,
      token_type: 'Bearer',
      user: {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        account_status: user.accountStatus,
        buet_id: user.buetId,
        department: user.department,
      },
    }
  }, {
    body: z.object({
      ...loginRequestBodySchema
    })
  })
  .post("/register", async ({ request, body, set }) => {

    /* TODO: if in future we need high security
    ** if (!BUET_EMAIL_REGEX.test(body.email)) {
    **   set.status = 400;
    **   return { error: 'INVALID_EMAIL', message: 'Only @*.buet.ac.bd addresses are accepted.' };
    ** }
    */

    const existingEmail = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

    if (existingEmail.length > 0) {
      set.status = 409;
      return { error: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists.' };
    }

    const existingBuetId = await db.select().from(users).where(eq(users.buetId, body.buet_id)).limit(1);

    if (existingBuetId.length > 0) {
      set.status = 409;
      return { error: 'BUET_ID_ALREADY_EXISTS', message: 'An account with this BUET ID already exists. Contact Support to get proepr help' };
    }

    const password_hash = await Bun.password.hash(body.password, "bcrypt");

    const user: typeof users.$inferInsert = {
      email: body.email,
      fullName: body.full_name,
      gender: body.gender,
      role: body.role,
      passwordHash: password_hash,
      buetId: body.buet_id,
      department: body.department,
    }

    await db.insert(users).values(user);

    set.status = 201;

    /* TODO: if in future we need high security
    ** return {
    **   message: 'Account created. Verify your BUET email to continue.',
    **   verification_methods: ['buet_email', 'id_card (coming soon)'],
    ** };
    */

    return {
      message: 'Account created. You are ready to go!',
      verification_methods: [],
    }
  }, {
    body: z.object({
      ...registerRequestBodySchema,
    })
  })
  .post("/refresh", async ({ body: { refresh_token }, refreshJwt, accessJwt, set }) => {

    const payload = await refreshJwt.verify(refresh_token);
    if (!payload) return { error: 'REFRESH_INVALID', message: 'Invalid or expired refresh token.' };

    const { jti, sub: userId } = payload as { jti: string; sub: string };

    const sessionObj = await db.select().from(sessions).where(and(eq(sessions.jti, jti), eq(sessions.userId, userId))).limit(1);

    if (sessionObj.length === 0) {
      // jti missing — token already rotated or stolen
      // Reuse detection: nuke all sessions for this user
      await db.delete(sessions).where(eq(sessions.userId, userId));
      return set.status = 401, { error: 'REFRESH_REUSE', message: 'Please log in again.' };
    }

    const userObj = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (userObj.length === 0 || userObj[0].accountStatus === 'suspended') {
      await db.delete(sessions).where(eq(sessions.userId, userId));
      return set.status = 403, { error: 'ACCOUNT_SUSPENDED' };
    }

    const user = userObj[0];

    const newJti = crypto.randomUUID();

    await db.transaction(async (tx) => {
      await tx.delete(sessions).where(eq(sessions.jti, jti)); // invalidate old session
      await tx.insert(sessions).values({
        jti: newJti,
        userId: userId,
        expiresAt: new Date(Date.now() + config.auth.jwt.refreshTokenExpInMs)
      })
    });

    const newAccessToken = await accessJwt.sign({
      sub: user.id,
      email: user.email,
      buet_id: user.buetId,
      role: user.role,
      gender: user.gender
    })

    const newRefreshToken = await refreshJwt.sign({
      jti: newJti,
      sub: user.id,
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in_ms: config.auth.jwt.accessTokenExpInMs,
      token_type: 'Bearer',
    };
  }, {
    authn: true,
    body: z.object({
      refresh_token: z.jwt()
    })
  })
  .post("/logout", async ({ body: { refresh_token }, refreshJwt }) => {
    const payload = await refreshJwt.verify(refresh_token);

    if (payload?.jti) {
      await db.delete(sessions).where(eq(sessions.jti, payload.jti));
    }
    return {
      message: "Logged out successfully."
    }
  }, {
    authn: true,
    body: z.object({
      refresh_token: z.jwt()
    })
  })
  .post("/logout-all", async ({ user }) => {
    await db.delete(sessions).where(eq(sessions.userId, user.userId));
    return {
      message: "All sessions logged out successfully."
    }
  }, {
    authn: true,
  })

