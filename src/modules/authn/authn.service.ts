import Elysia from "elysia";
import { authn, refreshJwt } from "../../middlewares/authn.middleware";

export const authnService = new Elysia({ name: "authn.service" })
  .use(authn)
  .use(refreshJwt)
  .macro({
    login: {

    }
  })
