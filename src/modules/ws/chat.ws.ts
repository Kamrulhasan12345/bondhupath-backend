import { t } from 'elysia'               // optional schema
import { Elysia } from 'elysia'    // if you need ctx typing
import { authn } from '../../middlewares/authn.middleware'

export const chatWs = new Elysia({ name: "chat.ws" })
  .use(authn)
  .ws('/chat', {
    // optional validation – same schema as a normal route
    body: t.String(),
    response: t.String(),
    authn: true,

    // called when a client sends a message
    message(ws, msg) {
      // echo back, or broadcast to other clients
      ws.send(`you said: ${msg}`)
    },

    // optional hooks
    open(ws) {
      console.log('🔗 client connected')
    },
    close(ws) {
      console.log('❌ client disconnected')
    }
  })
