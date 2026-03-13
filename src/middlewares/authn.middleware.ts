import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import config from "../config/config";

export const accessJwt = new Elysia({ name: "accessJwt.middleware" })
  .use(jwt({
    name: "accessJwt",
    secret: config.auth.jwt.access_secret,
    exp: config.auth.jwt.accessTokenExp,
  }));

export const refreshJwt = new Elysia({ name: "refreshJwt.middleware" })
  .use(jwt({
    name: "refreshJwt",
    secret: config.auth.jwt.refresh_secret,
    exp: config.auth.jwt.refreshTokenExp,
  }))

export const authn = new Elysia({ name: "authn.middleware" })
  .use(accessJwt)
  .macro("authn", {
    resolve: (async ({ request, set, accessJwt }) => {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        throw { error: 'MISSING_TOKEN', message: 'Authorization: Bearer <token> required.' };
      }

      const payload = await accessJwt.verify(authHeader.slice(7));

      if (!payload) {
        set.status = 401;
        throw { error: 'INVALID_TOKEN', message: 'Invalid or expired access token.' };
      }

      return {
        user: {
          userId: payload.sub,
          role: payload.role,
          email: payload.email,
          gender: payload.gender
        }
      }
    })
  })
