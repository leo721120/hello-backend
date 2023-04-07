import prototype from '@io/lib/express.request'
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
        function queryfield<V>(field: string, value: V | undefined): typeof value {
            const node = openapi.node(
                'paths',
                JSON.pointer.escape(req.route.path),
                req.method.toLowerCase(),
                'parameters',
            ).find(function (node) {
                const param = node.as('openapi.parameter');
                return param.schema.in === 'query'
                    && param.schema.name === field
                    // value can be omitted
                    && (param.schema.required || value !== undefined)
                    ;
            });
            node?.node('schema').assert(value, {
                instance: `${req.path}?${field}=`,
                params: { field },
            });
            return value;
        }
        Object.assign(req, <typeof req>{
            querystrings(name) {
                const value = prototype.querystrings.call(this, name);
                return queryfield(name, value);
            },
            querystring(name) {
                const value = prototype.querystring.call(this, name);
                return queryfield(name, value);
            },
            querynumber(name) {
                const value = prototype.querynumber.call(this, name);
                return queryfield(name, value);
            },
            parameter(name) {
                const value = this.params[name];
                const field = function () {// convert express `path` to openapi `path`
                    const p = req.route.path as string;
                    return p.replace(`:${name}`, `{${name}}`);
                };
                {
                    openapi.node(
                        'paths',
                        JSON.pointer.escape(field()),
                        //req.method.toLowerCase(),
                        'parameters',
                    ).find(function (node) {
                        const param = node.as('openapi.parameter');
                        return param.schema.in === 'path'
                            && param.schema.name === name
                            ;
                    })?.node('schema').assert(this.params[name]);
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