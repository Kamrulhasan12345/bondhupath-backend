import { ServerWebSocket } from "bun";
import config from "../../config/config";
import { sessions } from "./ws-sessions.store";
import { Context } from "elysia";

const timers = new Map<string, Timer>();

// TODO: type ws properly and use that instead of `any`
export const scheduleTokenExpiry = (ws: any, wsId: string) => {
  const interval = setInterval(() => {
    const session = sessions.get(wsId);
    if (!session) return clearInterval(interval);

    const now = Date.now();
    const expMs = session.exp * 1000;

    // ── WARN: token expiring soon ──────────────────────────────────
    if (!session.warningSent && now >= expMs - config.auth.jwt.wsTokenGracePeriodInMs) {
      session.warningSent = true;
      ws.send(JSON.stringify({
        type: "token_expiring",
        ttl: Math.floor((expMs - now) / 1000), // seconds remaining
      }));
    }

    // ── HARD CLOSE: past grace period with no refresh ──────────────
    if (now > session.refreshDeadline) {
      ws.send(JSON.stringify({ type: "token_expired" }));
      ws.close(4001, "Token expired");
      clearInterval(interval);
      sessions.delete(wsId);
    }
  }, 10_000);

  timers.set(wsId, interval);
}

export const clearSessionTimers = (socketId: string) => {
  const t = timers.get(socketId);
  if (t) { clearInterval(t); timers.delete(socketId); }
}

export { timers };
