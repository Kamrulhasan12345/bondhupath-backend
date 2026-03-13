import Elysia from "elysia";
import { authn } from "../../middlewares/authn.middleware";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authn)
  .get("/", async ({ user }) => {
    return {
      message: "Get all users endpoint - implement your logic here",
      user: user
    }
  }, {
    authn: true
  });
