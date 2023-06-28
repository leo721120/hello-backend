import express from '@io/app/express'
import path from 'node:path'
import '@io/lib/json'
export default express.service(function (app) {
    const openapi = JSON.schema('openapi.json',
        JSON.openapi(path.join(__dirname, 'openapi.yml'))
    );
    app.get('/favicon.ico', function (req, res) {
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
            req.tracecontext()
        );
        res.once('finish', function () {
            app.emit('event', {
                ...req.tracecontext(),
                elapse: res.elapse(),
                type: res.statusCode.toString(),
                time: undefined,// useless
                data: undefined,// omit
            });
        });
        next();
    }).use(express.openapi(openapi));
});