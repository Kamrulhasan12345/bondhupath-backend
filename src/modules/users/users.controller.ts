import Elysia from "elysia";
import { authz } from "../../middlewares/authz.middleware";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authz)
  .get("/me", async ({ userObj }) => {
    return {
      user: userObj
    }
  }, {
    authz: true
  });
