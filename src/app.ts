import { Elysia } from "elysia";
import { wrap } from "@bogeychan/elysia-logger";
import cors from "@elysiajs/cors";

import logger from "./utils/logger";
import { chatWs } from "./modules/ws/chat.ws";
import config from "./config/config";
import { authController } from "./modules/authn/authn.controller";
import { usersController } from "./modules/users/users.controller";
import openapi, { fromTypes } from "@elysiajs/openapi";
import prometheusPlugin from 'elysia-prometheus'

const app = new Elysia();

app
  .use(wrap(logger, { autoLogging: true }))
  .use(
    prometheusPlugin({
      metricsPath: '/metrics',
      staticLabels: { service: 'my-app' },
      dynamicLabels: {
        userAgent: (ctx) =>
          ctx.request.headers.get('user-agent') ?? 'unknown'
      }
    })
  )
  .use(openapi({
    references: fromTypes()
  }))
  .use(chatWs)
  .use(authController)
  .use(usersController)

export default app;
