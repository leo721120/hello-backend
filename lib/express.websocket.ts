import websockify from 'express-ws'
import express from 'express'
export default Object.assign(express.application, <Application>{
    websocket() {
        Object.assign(this, { ws: undefined });
        const ws = websockify(this).getWss();
        this.websocket = () => ws;
        return ws.once('close', function () {
            // also close socket to prevent hanging
            ws.options.server?.close();
        });
    },
    ws(...a) {
        this.websocket();
        return this.ws(...a);
    },
});
declare global {
    namespace Express {
        interface Application extends websockify.WithWebsocketMethod {
            websocket(): ReturnType<websockify.Instance['getWss']>
        }
    }
}