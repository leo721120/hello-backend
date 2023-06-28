import websocket from 'express-ws'
import express from 'express'
import ws from 'ws'
import '@io/lib/error'
import '@io/lib/event'
import '@io/lib/node'
import '@io/lib/json'
{// make router handler can support async-await
    const layer = require('express/lib/router/layer');
    layer.prototype.handle_request = <express.RequestHandler>function (this: typeof layer, req, res, next) {
        const fn = this.handle as express.RequestHandler;

        if (fn.length > 3) {
            return next();
        }
        Promise.try(function () {
            return fn(req, res, next);
        }).catch(next);
    };
}
export function builder() {
    return <Application>express();
}
export default Object.assign(builder, express, {
    middleware(cb: express.RequestHandler): typeof cb {
        return cb;
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
    openapi(openapi: ReturnType<typeof JSON.schema>): express.RequestHandler {
        return function (req, res, next) {
            function queryfield<V>(field: string, value: V | undefined): typeof value {
                const node = openapi.node(
                    'paths',
                    JSON.pointer.escape(req.router()),
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
                    resource: `${req.path}?${field}=`,
                    params: { field },
                });
                return value;
            }
            Object.assign(req, <typeof req>{
                router() {
                    const path = Object
                        .keys(req.params)
                        .reduce(function (p, name) {
                            return p.replace(`:${name}`, `{${name}}`);
                        }, req.route.path as string);
                    this.router = () => {
                        return path;
                    };
                    return path;
                },
                querystrings(name) {
                    const value = express.request.querystrings.call(this, name);
                    return queryfield(name, value);
                },
                querystring(name) {
                    const value = express.request.querystring.call(this, name);
                    return queryfield(name, value);
                },
                querynumber(name) {
                    const value = express.request.querynumber.call(this, name);
                    return queryfield(name, value);
                },
                parameter(name) {
                    const value = this.params[name];
                    {
                        openapi.node(
                            'paths',
                            JSON.pointer.escape(req.router()),
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
                        JSON.pointer.escape(req.router()),
                        req.method.toLowerCase(),
                        'requestBody',
                        'content',
                        JSON.pointer.escape(type),
                        'schema',
                    ).attempt(this.body);
                },
                header(name) {
                    const value = express.request.header.call(this, name);
                    const node = openapi.node(
                        'paths',
                        JSON.pointer.escape(req.router()),
                        req.method.toLowerCase(),
                        'parameters',
                    ).find(function (node) {
                        const param = node.as('openapi.parameter');
                        return param.schema.in === 'header'
                            && param.schema.name.toLowerCase() === name.toLowerCase()
                            // value can be omitted
                            && (param.schema.required || value !== undefined)
                            ;
                    });
                    node?.node('schema').assert(value, {
                        params: { name },
                    });
                    return value;
                },
            });
            next();
        };
    },
    slowdown(params: {
        /**
        used to generate key for each request
        */
        key?(req: express.Request, res: express.Response): string
        /**
        time frame for which requests are checked/remembered, in milliseconds

        @default 60_000
        */
        readonly time?: number
        /**
        @default 60
        */
        readonly max?: number
        readonly map?: Map<string, {
            /**
            how many requests have been made in this window
            */
            readonly count: number | 0
            readonly time: Date
        }>
    }): express.RequestHandler {
        const window = <Required<typeof params>>{
            time: 60_000,// 60 seconds
            max: 60,
            map: new Map(),
            key(req, res) {
                return req.ip;
            },
            ...params,
        };
        return function (req, res, next) {
            const key = window.key(req, res);
            const prev = window.map.get(key) ?? {
                time: req.now,
                count: 0,
            };
            const diff = req.now.getTime()
                - prev.time.getTime()
                ;
            if (diff >= window.time) {// move to new window
                Object.assign(prev, <typeof prev>{
                    time: req.now,
                    count: 0,
                });
            }
            {// https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
                const reset = Math.ceil((prev.time.getTime() + window.time) / 1000);

                res.setHeader('RateLimit-Remaining', window.max - prev.count);
                res.setHeader('RateLimit-Reset', reset);
                res.setHeader('RateLimit-Limit', window.max);
            }
            if (prev.count + 1 > window.max) {
                throw Error.build({
                    retrydelay: (prev.time.getTime() + window.time) - Date.now(),
                    message: 'too many requests',
                    status: 429,
                    name: 'SlowDown',
                });
            }
            window.map?.set(key, {
                count: prev.count + 1,
                time: prev.time,
            });
            return next();
        };
    },
});
declare module 'ws' {
    interface Server {
        /**
        @returns websocket to this server, auto close when server down
        */
        connect(path: string): WebSocket
    }
}
declare global {
    namespace Express {
        interface Application extends websocket.WithWebsocketMethod {
            readonly express: typeof express
            readonly handle: express.RequestHandler
            readonly final: express.ErrorRequestHandler
            authenticate<U extends object>(type: Lowercase<string>): Authenticate<U> | undefined
            authenticate<U extends object>(type: Lowercase<string>, cb: Authenticate<U>): this
            websocket(): ReturnType<websocket.Instance['getWss']>
            service<V>(name: string, factory: () => V): this
            service<V>(name: string): V
            setup<V>(object: { default: Setup<V> }): Promise<V>
        }
        interface Response {
            /**
            @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing
            */
            servertiming(metric: string): this
            /**
            https://developers.google.com/search/docs/advanced/robots/robots_meta_tag?hl=zh-tw#xrobotstag
            */
            robotstag(value: 'noindex' | 'none'): this
            /**
            how much time has elapsed since receiving the request
            */
            elapse(): number
            /**
            response an error as rfc7807
            */
            error(e: Error): this
            /**
            format to HTTP/1.1 Content-Range header field.

            @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range
            */
            range(params: {
                readonly unit: 'items'
                readonly size: number
                readonly start?: number
                readonly end?: number
            }): this
        }
        interface Request {
            /**
            time to receive this request
            */
            readonly now: Date
            /**
            check if querystring with debug flags
            */
            debug(flag: 'trace'): boolean
            debug(flag: 'error'): boolean
            debug(flag: string): boolean
            /**
            */
            origin(): string | 'http://localhost:8080'
            /**
            useful to convert express `path` to openapi `path`
            
            @default req.route.path
            */
            router(): string | '/path/to/route'
            /**
            extract tracecontext from header
            */
            tracecontext(): CloudEvent<string>
            /**
            @return query-strings with array type
            */
            querystrings<K extends string>(name: string): readonly K[]
            /**
            @return first value from `querystrings`
            */
            querystring<K extends string>(name: string): K | undefined
            /**
            @return from querystring, but convert to number
            */
            querynumber<K extends number>(name: string): K | undefined
            /**
            @return value from `params[name]`
            */
            parameter<K extends string>(name: string): K
            /**
            return body content
            */
            content<V>(): V
            content<V>(mime: 'application/json'): V
            content<V>(mime: 'application/cloudevents+json'): V
            /**
            extract authorization header as [type, credentials]
            */
            authorization(): [Lowercase<string>, string]
            /**
            find user object from registered authenticate functions
            */
            authenticate<U extends object>(): Promise<U>
        }
    }
    interface Application extends Express.Application, ReturnType<typeof express> {
        on<A extends unknown>(event: string, cb: (...a: A[]) => void): this
        //
        on(event: 'error', cb: (e: Error) => void): this
        off(event: 'error', cb: (e: Error) => void): this
        once(event: 'error', cb: (e: Error) => void): this
        emit(event: 'error', e: Error): boolean
        on(event: 'close', cb: () => void): this
        off(event: 'close', cb: () => void): this
        once(event: 'close', cb: () => void): this
        emit(event: 'close'): boolean
    }
}
interface Authenticate<U extends object> {
    (req: express.Request): PromiseLike<U> | U
}
interface Setup<V> {
    (app: Application): PromiseLike<V> | V
}
namespace prototype {
    export const application = { ...express.application };
    export const response = { ...express.response };
}
namespace internal {
    export interface TimingMetric {
        readonly desc: string
        readonly dur: number
    }
    export interface Response extends express.Response {
        servertimings?: {
            send(): Response
            stringify(): string
            metrics: Array<TimingMetric>
            time: Date
        }
    }
}
Object.assign(express.application, <Application>{
    express,
    //
    service(name, factory) {
        const key = `service/${name}`;
        const get = () => {
            const f = this.get(key) as typeof factory;
            console.assert(f, `service/${name} is not found`);
            return f();
        };
        const set = () => {
            return this.set(key, () => {
                const v = factory() as unknown;
                this.set(key, () => v);
                return v;
            });
        };
        return arguments.length > 1
            ? set()
            : get()
            ;
    },
    setup(object) {
        return object.default(this);
    },
    authenticate(type, cb) {
        const key = `authenticate/${type}`;
        const get = () => {
            return this.get(key);
        };
        const set = () => {
            return this.set(key, cb);
        };
        return arguments.length === 1
            ? get()
            : set()
            ;
    },
    handle(req, res, next) {
        const done = (err?: Error) => {
            const e = err ?? Error.build({
                message: `method not found`,
                name: SyntaxError.name,
                status: 400,
            });
            this.final(e, req, res, next);
        };
        Object.assign(req, <typeof req>{
            now: new Date(),
        });
        return prototype.application.handle.call(this, req, res, next ?? done);
    },
    final(err: Error, req, res, next) {
        res.error(err);
    },
    websocket() {
        Object.assign(this, { ws: undefined });
        const wss = websocket(this).getWss();
        Object.assign(wss, <typeof wss>{
            connect(path) {
                const addr = this.address() as { readonly port: number };
                const uri = new URL(path, 'ws://localhost');
                //uri.hostname = 'localhost';
                //uri.protocol = 'ws';
                uri.port = addr.port.toString();
                const client = new ws(uri.toString());
                this.once('close', () => client.close());
                return client;
            },
        });
        this.websocket = () => {
            return wss;
        };
        return wss.once('close', function () {
            // also close socket to prevent hanging
            wss.options.server?.close();
        });
    },
    ws(...a) {
        this.websocket();
        return this.ws(...a);
    },
});
Object.assign(express.response, <typeof express.response>{
    servertiming(metric) {
        const self = this as internal.Response;
        self.servertimings ??= {
            time: this.req.now,
            metrics: [],
            stringify() {
                delete self.servertimings;
                return this.metrics.map(function (metric, idx) {
                    return `${idx};desc=${metric.desc};dur=${metric.dur}`;
                }).join(',');
            },
            send() {
                return self.setHeader('Server-Timing', this.stringify());
            },
        };

        const metrics = self.servertimings.metrics;
        const prev = self.servertimings.time;
        const now = new Date();
        const dur = now.getTime() - prev.getTime();
        metrics.push({ desc: metric, dur });
        self.servertimings.time = now;
        return this;
    },
    robotstag(value) {
        return this.setHeader('X-Robots-Tag', value);
    },
    elapse() {
        return Date.now() - this.req.now.getTime();
    },
    error(e) {
        if (e.retrydelay) {// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
            const delay = Math.ceil(e.retrydelay / 1000);// convert to seconds
            this.set('Retry-After', delay.toString());
        }

        this.type('application/problem+json');
        this.status(e.status ?? 500);
        this.json(<rfc7807>{
            title: e.name,
            status: this.statusCode,
            detail: e.message,
            instance: e.resource ?? this.req.path,
        });
        if (this.app.listeners('error').length) {
            this.app.emit('error', e, this.req.tracecontext());
        }
    },
    range(params) {
        const ranges = [params.start, params.end]
            .filter(Boolean)
            ;
        const range = ranges.length
            ? ranges.join('-')
            : '*'
            ;
        return this.setHeader('Content-Range',
            `${params.unit} ${range}/${params.size}`
        );
    },
    send(...a) {
        const self = this as internal.Response;
        self.servertimings?.send();
        this.setHeader('TraceParent', this.req.tracecontext().id);
        this.setHeader('X-Elapsed-Time', this.elapse());
        return prototype.response.send.call(this, ...a);
    },
});
Object.assign(express.request, <typeof express.request>{
    debug(flag) {
        /*! side effect from json schema validation
        return this
            .querystrings('debug')
            .includes(flag)
            ;*/
        return express.request
            .querystrings.call(this, 'debug')
            .includes(flag)
            ;
    },
    origin() {
        const port = this.socket.localPort ?? (this.secure ? 443 : 80);
        const url = new URL('http://localhost');
        url.protocol = this.protocol;
        url.hostname = this.hostname;
        url.port = port.toString();
        const origin = url.origin;
        this.origin = () => origin;
        return origin;
    },
    router() {
        return this.route.path;
    },
    tracecontext() {
        const e = CloudEvent({
            // generate new one if not exist
            id: this.header('traceparent') ?? CloudEvent.id(),
            type: this.method.toUpperCase(),
            data: undefined,
            source: this.url,
            specversion: '1.0',
        });
        if (this.debug('trace')) {
            const res = this.res;

            Object.assign(e, <typeof e>{
                servertiming(metric) {
                    res?.servertiming(metric);
                },
            });
        }
        this.tracecontext = () => {
            return e;
        };
        return e;
    },
    querystrings(name) {
        const list = [].concat(this.query[name] as [] ?? [])
            .join(',')
            .split(',')
            .filter(Boolean)// remove empty
            ;
        return list as readonly string[];
    },
    querystring(name) {
        return this.query[name];
    },
    querynumber(name) {
        return this.query[name]?.toString().numberify();
    },
    parameter(name) {
        return this.params[name];
    },
    content() {
        return this.body;
    },
    authorization() {
        const header = this.header('authorization') ?? '';
        const [type = '', credentials = ''] = header.split(' ');
        const authorization = [type.toLowerCase(), credentials] as ReturnType<typeof this.authorization>;
        this.authorization = () => authorization;
        return authorization;
    },
    async authenticate() {
        const tracecontext = this.tracecontext();
        const [type] = this.authorization();
        const cb = this.app.authenticate(type) ?? function () {
            throw Error.build({
                message: 'unknown authenticate type',
                name: 'Unauthorized',
                status: 401,
                params: { type },
            });
        };
        const info = await cb(this);
        {
            tracecontext.servertiming?.('authenticate');
        }
        this.authenticate = async () => {
            return info as never;
        };
        return info;
    },
});