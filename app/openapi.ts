import express from '@io/lib/express'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    const openapi = JSON.schema('openapi.json',
        JSON.openapi(path.join(__dirname, 'openapi.yml'))
    );
    app.get('/favicon.ico', async function (req, res) {
        res.sendFile(path.join(__dirname, '../logo.ico'));
    }).get('/openapi', function (req, res) {
        res.format({
            json() {
                res.json(openapi.schema);
            },
            html() {
                res.sendFile(path.join(__dirname, './openapi.html'));
            },
        });
    }).use(function (req, res, next) {
        app.emit('event',
            req.cloudevent()
        );
        res.once('finish', function () {
            app.emit('event', {
                ...req.cloudevent(),
                elapse: res.elapse(),
                type: res.statusCode.toString(),
                time: undefined,// useless
                data: undefined,// omit
            });
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
    }).use(express.openapi(openapi));
});