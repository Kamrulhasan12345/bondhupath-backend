import Elysia from "elysia";
import { authn, refreshJwt } from "../../middlewares/authn.middleware";
import z from "zod";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authn)
  .use(refreshJwt)
  .post("/login", async (c) => {
    return {
      message: "Login endpoint - implement your logic here",
    }
  })
  .post("/register", async (c) => {
    return {
      message: "Register endpoint - implement your logic here",
    }
  })
  .post("/refresh", async ({ body: { refresh } }) => {
    return {
      message: "Refresh endpoint - implement your logic here",
      refreshToken: refresh
    }
  }, {
    authn: true,
    body: z.object({
      refresh: z.jwt()
    })
  })
  .post("/logout", async ({ body: { refresh } }) => {
    return {
      message: "Logout endpoint - implement your logic here",
      refreshToken: refresh
    }
  }, {
    authn: true,
    body: z.object({
      refresh: z.jwt()
    })
  })

