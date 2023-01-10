import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import websockify from 'express-ws'
import express from 'express'
import '@io/lib/error'
import '@io/lib/node'
const prototype = {
    ...express.application,
};
export default <Application>Object.assign(express.application, <Application>{
    express,
    //
    service(name, factory) {
        const key = `service/${name}`;
        const get = () => {
            return this.get(key);
        };
        const set = () => {
            return this.set(key, Promise.defer(factory));
        };
        return arguments.length > 1
            ? set()
            : get()
            ;
    },
    setup(object) {
        return object.default(this);
    },
    async fetch(config) {
        const events = await import('node:events');
        const mock = await import('node-mocks-http');
        const req = mock.createRequest({
            app: this,
            baseUrl: '',
            hostname: 'localhost',
            protocol: 'http',
            method: config.method?.toUpperCase() as 'GET',
            url: config.url,
            query: config.params,
            body: config.data as {},
            headers: { ...config.headers as {} },
        });
        const res = mock.createResponse({
            eventEmitter: events.EventEmitter,
            req,
        });
        {
            const mixin = await import('./express.response');
            Object.assign(res, mixin.default, { req, app: this });
        }
        if (config.auth) {
            req.headers.authorization = `basic ${[
                config.auth.username,
                config.auth.password,
            ].join(':').base64enc()}`;
        }
        const data = function () {
            const buffer = res._getBuffer();
            if (buffer?.length) return buffer;
            const data = res._getData();
            if (Buffer.isBuffer(data)) return data;
            if (typeof data === 'string') return Buffer.from(data);
            return Buffer.from(JSON.stringify(data));
        };
        const body = function <V>() {
            const body = data();

            if (!config.responseType && body.length) {
                config.responseType = 'json';// keep unset if body is empty
            }
            if (config.responseType === 'json') {
                return JSON.parse(body.toString()) as V;
            }
            if (config.responseType === 'arraybuffer') {
                return body;
            }
            if (res._isJSON()) {
                return JSON.parse(body.toString()) as V;
            }
            return body;
        };
        const done = events.default.once(res, 'finish');
        {
            this(req, res);
        }
        if (!res._isEndCalled()) {
            await done;
        }
        return {
            data: body(),
            status: res._getStatusCode(),
            statusText: res._getStatusMessage(),
            headers: res._getHeaders(),
            request: req,
            config,
        };
    },
    authenticate(type, cb) {
        const key = `authenticate-${type}`;
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
        Object.assign(req, <typeof req>{
            now: new Date(),
        });
        return prototype.handle.call(this, req, res, next ?? function (err?: Error) {
            const e = err ?? Error.Code({
                message: `method not found`,
                name: 'BadRequest',
                errno: 400,
            });
            req.app.final(e, req, res, next);
        });
    },
    final(err, req, res, next) {
        res.error(err);
    },
    ws(...a) {
        this.websocket();
        return this.ws(...a);
    },
    websocket() {
        Object.assign(this, { ws: undefined });
        const ws = websockify(this).getWss();
        this.websocket = () => ws;
        return ws;
    },
});
declare global {
    namespace Express {
        interface Application extends websockify.WithWebsocketMethod {
            readonly express: typeof express
            readonly handle: express.RequestHandler
            readonly final: express.ErrorRequestHandler
            websocket(): ReturnType<websockify.Instance['getWss']>
            service<V>(name: string, factory: () => PromiseLike<V> | V): this
            service<V>(name: string): Promise<V>
            setup<V>(object: { default: Setup<V> }): Promise<V>
            fetch<V = unknown, A = unknown>(req: AxiosRequestConfig<A>): Promise<AxiosResponse<V, A>>
            authenticate<U extends {}>(type: string, cb: Authenticate<U>): this
            authenticate<U extends {}>(type: string): Authenticate<U> | undefined
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
interface Setup<V> {
    (app: Application): PromiseLike<V> | V
}
interface Authenticate<U extends {}> {
    (req: express.Request): PromiseLike<U | undefined> | U | undefined
}