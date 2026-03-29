import { t } from 'elysia'               // optional schema
import { Elysia } from 'elysia'    // if you need ctx typing
import { authn } from '../../middlewares/authn.middleware'
import { sessions } from '../../utils/authn/ws-sessions.store'
import config from '../../config/config'
import { scheduleTokenExpiry, clearSessionTimers } from '../../utils/authn/ws-token-scheduler'
import { JWTTokenPayload } from '../../utils/authn/jwt'
import z from 'zod'

export const chatWs = new Elysia({ name: "chat.ws" })
  .use(authn)
  .ws('/chat', {
    ws_authn: true,
    body: z.object({
      type: z.string().min(1),
      value: z.string().optional()
    }),

    open: async (ws) => {
      console.log(`${ws.data.server}`)

      sessions.set(ws.id, {
        userId: ws.data.user.userId,
        fullName: ws.data.user.fullName,
        buetId: ws.data.user.buetId,
        gender: ws.data.user.gender,
        role: ws.data.user.role,
        exp: ws.data.user.exp,
        warningSent: false,
        authenticated: true,
        refreshDeadline: ws.data.user.exp * 1000 + config.auth.jwt.wsTokenGracePeriodInMs
      })

      console.log(`⏰ scheduled token expiry for ${ws.data.user.buetId} at ${new Date(ws.data.user.exp * 1000 + config.auth.jwt.wsTokenGracePeriodInMs).toLocaleString()}`);

      scheduleTokenExpiry(ws, ws.id);

      ws.send(JSON.stringify({ type: "connected", userId: ws.data.user.userId, fullName: ws.data.user.fullName, buetId: ws.data.user.buetId }));
    },
    message: async (ws, body) => {
      ws.data.user && console.log(`📩 message from ${ws.data.user.buetId}: ${body.type}`)

      const session = sessions.get(ws.id);

      if (!session?.authenticated) {
        ws.send(JSON.stringify({ type: "error", error: "UNAUTHORIZED" }));
        return;
      }

      if (body.type === "auth_refresh") {
        const payload: JWTTokenPayload = await ws.data.wsJwt.verify(body.value);
        console.log(payload)

        if (!payload || payload.sub !== session.userId || payload.full_name != session.fullName || payload.buet_id != session.buetId || session.gender != payload.gender || session.role != payload.role) {
          // Wrong user or invalid token — kill the connection
          ws.send(JSON.stringify({ type: "auth_failed", reason: "invalid_token" }));
          ws.close(4003, "Auth failed");
          return;
        }

        session.exp = ws.data.user.exp = payload.exp;
        session.warningSent = false;
        session.authenticated = true;
        session.refreshDeadline = payload.exp * 1000 + config.auth.jwt.wsTokenGracePeriodInMs;


        console.log(`⏰ scheduled token expiry for ${ws.data.user.buetId} at ${new Date(payload.exp * 1000 + config.auth.jwt.wsTokenGracePeriodInMs).toLocaleString()}`);

        ws.send(JSON.stringify({ type: "auth_ok", exp: payload.exp }));
      }

      console.log(body.value)
    },
    close: async (ws) => {

      clearSessionTimers(ws.id);
      sessions.delete(ws.id);
      ws.data.user && console.log(`👋 goodbye ${ws.data.user.buetId}`)
    },
    drain: async (ws) => {
      console.log('💧 backpressure drained, ready to send more messages');
    },

    error: async (ws) => {

    }
  })
