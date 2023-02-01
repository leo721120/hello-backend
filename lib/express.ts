{// make router handler can support async-await
    const layer = require('express/lib/router/layer');
    layer.prototype.handle_request = <express.RequestHandler>function (this: any, req, res, next) {
        const fn = this.handle as express.RequestHandler;

        if (fn.length > 3) {
            return next();
        }
        Promise.try(function () {
            return fn(req, res, next);
        }).catch(next);
    };
}
import '@io/lib/express.application'
import '@io/lib/express.websocket'
import '@io/lib/express.response'
import '@io/lib/express.request'
import express from 'express'
import ws from 'ws'
export function Builder() {
    return <Application>express();
}
export default Object.assign(Builder, {
    middleware(cb: express.RequestHandler): typeof cb {
        return cb;
    },
    /**
    @returns websocket to this server, auto close when server down
    */
    websocket(app: Application, path: string) {
        const srv = app.websocket();
        const addr = srv.address() as { readonly port: number };
        const websocket = new ws(`ws://localhost:${addr.port}/${path.split('/').filter(Boolean).join('/')}`);
        srv.once('close', () => websocket.close());
        return websocket;
    },
    service<V>(cb: (app: Application) => PromiseLike<V> | V): typeof cb {
        return cb;
    },
    /**
    wrap application for test
    */
    fetch(app: Application) {
        const name = 'supertest';// use variable to prevent pkg include this
        const mock = require(name) as typeof import('supertest');
        return mock(app);
    },
});