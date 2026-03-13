import Elysia from "elysia";
import { authn } from "./authn.middleware";

export const authz = new Elysia({ name: "authz.middlware" })
  .use(authn)
  .macro("authz", {
    authn: true,
    resolve: async ({ user, request, set }) => {

    }
  })
