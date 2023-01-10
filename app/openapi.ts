import express from '@io/lib/express'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export default express.setup(function (app) {
    const openapi = JSON.schema('openapi.json',
        JSON.openapi(path.join(__dirname, 'openapi.yml'))
    );
    Object.assign(app, <typeof app>{
        final(err: Error, req, res, next) {
            res.error(err).app.emit('error', {
                name: req.tracecontext().traceparent(),
                type: err.errno,
                code: err.name,
                text: err.message,
                params: err.params,
            });
        },
    });
    app.get('/openapi', function (req, res) {
        res.type('html').sendFile(path.join(__dirname, './openapi.html'), {
        });
    }).use(function (req, res, next) {
        app.emit('event', {
            name: req.tracecontext().traceparent(),
            method: req.method,
            url: req.path,
            query: req.query,
        });
        res.once('finish', function () {
            app.emit('event', {
                name: req.tracecontext().traceparent(),
                elapse: res.elapse(),
                status: res.statusCode,
            });
        });
        Object.assign(req, <typeof req>{
            content(type: string = 'application/json') {
                return openapi.child(
                    'paths',
                    JSON.pointer.escape(req.route.path),
                    req.method.toLowerCase(),
                    'requestBody',
                    'content',
                    JSON.pointer.escape(type),
                    'schema',
                ).attempt(this.body);
            },
        });
        Object.assign(res, <typeof res>{
            send: Function.monkeypatch(res.send, function (cb) {
                return function (...a) {
                    res.setHeader('X-Elapsed-Time', res.elapse());
                    return cb.call(res, ...a);
                };
            }),
        });
        next();
    });
});