import '@io/lib/express.application'
import '@io/lib/express.websocket'
import '@io/lib/express.response'
import '@io/lib/express.request'
import express from 'express'
export function Builder() {
    return <Application>express();
}
export default Object.assign(Builder, {
    setup<V>(cb: (app: Application) => PromiseLike<V> | V): typeof cb {
        return cb;
    },
    middleware(cb: express.RequestHandler): typeof cb {
        return cb;
    },
});
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