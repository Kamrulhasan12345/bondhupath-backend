import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import config from "../config/config";
import z from "zod";
import { INVALID_TOKEN } from "../errors/invalid-token.error";
import { MISSING_TOKEN } from "../errors/missing-token.error";

export const accessJwt = new Elysia({ name: "accessJwt.middleware" })
  .use(jwt({
    name: "accessJwt",
    secret: config.auth.jwt.accessSecret,
    exp: config.auth.jwt.accessTokenExp,
  }));

export const refreshJwt = new Elysia({ name: "refreshJwt.middleware" })
  .use(jwt({
    name: "refreshJwt",
    secret: config.auth.jwt.refreshSecret,
    exp: config.auth.jwt.refreshTokenExp,
  }))

export const wsJwt = new Elysia({ name: "wsJwt.middleware" })
  .use(jwt({
    name: "wsJwt",
    secret: config.auth.jwt.wsSecret,
    exp: config.auth.jwt.wsTokenExp,
  }))

export const authn = new Elysia({ name: "authn.middleware" })
  .use(accessJwt)
  .use(wsJwt)
  .error({ MISSING_TOKEN, INVALID_TOKEN })
  .onError(({ error, code, status }) => {
    switch (code) {
      case 'MISSING_TOKEN': case 'INVALID_TOKEN': return status(401, { error: error.message, user: null });
    }
  })
  .macro("authn", {
    resolve: (async ({ request, set, accessJwt }) => {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        throw new MISSING_TOKEN('Authorization: Bearer <token> required.');
      }

      const payload = await accessJwt.verify(authHeader.slice(7));

      if (!payload) {
        set.status = 401;
        throw new INVALID_TOKEN('Invalid or expired access token.');
      }

      return {
        user: {
          userId: payload.sub,
          role: payload.role,
          fullName: payload.full_name,
          email: payload.email,
          buetId: payload.buet_id,
          gender: payload.gender,
          exp: payload.exp
        },
        error: null
      }
    })
  })
  .macro("ws_authn", {
    query: z.object({
      auth: z.jwt()
    }),

    resolve: async ({ request, set, wsJwt, body, query: { auth } }) => {
      if (!auth) {
        set.status = 401;
        throw new MISSING_TOKEN('Authorization: Bearer <token> required.');
      }

      const payload = await wsJwt.verify(auth);

      if (!payload) {
        set.status = 401;
        throw new INVALID_TOKEN('Invalid or expired access token.');
      }

      return {
        user: {
          userId: payload.sub,
          role: payload.role,
          fullName: payload.full_name,
          email: payload.email,
          buetId: payload.buet_id,
          gender: payload.gender,
          exp: payload.exp
        },
        error: null
      }
    }
  }
)
