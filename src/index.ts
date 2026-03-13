import app from "./app";
import config from "./config/config";

app.listen(config.server.port, () => console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`));
