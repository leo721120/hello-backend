import express from '@io/lib/express'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    const openapi = JSON.schema('openapi.json',
        JSON.openapi(path.join(__dirname, 'openapi.yml'))
    );
    Object.assign(app, <typeof app>{
        final(err: Error, req, res, _) {
            res.error(err);
            app.emit('error', err, req.cloudevent());
        },
    });
    app.get('/openapi', function (req, res) {
        res.format({
            json() {
                res.json(openapi.schema);
            },
            html() {
                res.sendFile(path.join(__dirname, './openapi.html'));
            },
        });
    }).use(function (req, res, next) {
        app.emit('event', req.cloudevent());
        res.once('finish', function () {
            app.emit('event', res.cloudevent());
        });
        Object.assign(req, <typeof req>{
            querystrings(name) {
                const value = [].concat(this.query[name] as [] ?? []) as readonly string[];
                {
                    openapi.node(
                        'paths',
                        JSON.pointer.escape(req.route.path),
                        req.method.toLowerCase(),
                        'parameters',
                    ).find(function (node) {
                        const param = node.as('openapi.parameter');
                        return param.schema.in === 'query'
                            && param.schema.name === name
                            ;
                    })?.assert(this.query[name]);
                }
                return value;
            },
            content(type: string = 'application/json') {
                return openapi.node(
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