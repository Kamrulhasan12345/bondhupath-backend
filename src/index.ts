import app from "./app";
import config from "./config/config";
import { server } from "./utils/server/server-ref";

app.listen(config.server.port, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
  server.instance = app.server;
});
