import type { AxiosRequestConfig } from 'axios'
import type { AxiosResponse } from 'axios'
import type { AxiosInstance } from 'axios'
import type { AxiosError } from 'axios'
import streams from 'node:stream'
import axios from 'axios'
import mime from 'mime'
import '@io/lib/event'
import '@io/lib/error'
import '@io/lib/json'
export function build(options?: Readonly<AxiosRequestConfig<never> & {
    /**
    interceptor for response
    */
    onres?(fetch: AxiosInstance): typeof fetch
    /**
    interceptor for request
    */
    onreq?(fetch: AxiosInstance): typeof fetch
}>) {
    const onres = options?.onres ?? function (a) {
        return a;
    };
    const onreq = options?.onreq ?? function (a) {
        return a;
    };
    const fetch = onreq(axios.create({
        baseURL: 'http://localhost',
        timeout: 60_000,
        ...options,
    }));
    fetch.interceptors.response.use(function (res) {
        const now = new Date();
        const req = res.config;
        {
            req.tracecontext?.servertiming?.('fetch');
        }
        return Object.assign(res, <typeof res>{
            tracecontext() {
                const e = CloudEvent({
                    id: this.headers?.['traceparent'] ?? req.tracecontext?.id,
                    data: undefined,
                    type: this.status.toString(),
                    //time: now.toISOString(),
                    source: req.url ?? '/',
                    elapse: this.elapse(),
                    specversion: '1.0',
                    servertiming: req.tracecontext?.servertiming,
                });
                this.tracecontext = () => {
                    return e;
                };
                return e;
            },
            mimetype() {
                const type = this.headers?.['content-type'];
                const ext = mime.getExtension(type) ?? 'json';
                return mime.getType(ext) ?? 'application/json';
            },
            elapse() {
                return req.now
                    ? now.getTime() - req.now
                    : -1;
            },
        });
    }, function (e: Readonly<AxiosError<Buffer | NodeJS.ReadableStream>>) {
        const res = e.response;
        const req = e.config;
        const body = function <V>(data: V | undefined): unknown | undefined {
            if (!data) {
                return undefined;
            }
            if (data instanceof streams.Readable) {
                return '<stream>';
            }
            if (data instanceof Buffer) {
                return '<buffer>'
            }
            return data;
        };
        throw Error.build({
            message: e.message,
            name: e.code ?? res?.statusText ?? e.name,
            errno: e.errno,
            status: res?.status ?? 504,
            reason: body(res?.data),
            params: e.params ?? {
                method: req?.method,
                url: req?.url,
                query: req?.params,
            },
        });
    });
    fetch.interceptors.request.use(function (req) {
        const now = req.now ?? Date.now();
        const method = req.method?.toUpperCase() ?? 'GET';
        const tracecontext = <typeof req.tracecontext>{
            servertiming: req.tracecontext?.servertiming,
            source: req.url ?? '/',
            type: method,
            // or generate new one
            id: req.tracecontext?.id ?? CloudEvent.id(),
        };
        {
            req.headers.set('traceparent', tracecontext!.id);
        }
        return Object.assign(req, <typeof req>{
            tracecontext,
            method,
            now,
        });
    }, function (e: Readonly<AxiosError>) {
        const res = e.response;
        const req = e.config;
        throw Error.build({
            message: e.message,
            name: e.code ?? res?.statusText ?? e.name,
            errno: e.errno,
            status: res?.status ?? 504,
            params: e.params ?? {
                method: req?.method,
                url: req?.url,
                query: req?.params,
            },
        });
    });
    return Object.assign(onres(fetch), {
        axios(params: typeof options) {
            return build({
                ...options,
                ...params,
            });
        },
    });
};
export default Object.assign(build, {
    /**
    @param openapi openapi schema
    @param fetch axios instance
    */
    openapi(fetch: ReturnType<typeof build>, openapi: ReturnType<typeof JSON.schema>) {
        async function invoke<R, D = unknown>(config: Omit<Readonly<AxiosRequestConfig>, 'url' | 'baseURL'> & {
            /**
            path in openapi definition
    
            @example /abc/{id}/xyz/{name}
            */
            readonly openapi: `/${string}`
            /**
            used for api path template (move querystring to `query`)
            */
            readonly params?: Record<string, string | number>
            readonly query?: Record<string, string | number>
            /**
            fixed to lowercase
            */
            readonly method: Lowercase<'get' | 'put' | 'head' | 'post' | 'patch' | 'delete' | 'options'>
            /**
            body data
            */
            readonly data?: D
        }) {
            const url = Object
                .entries(config.params ?? {})
                .reduce(function (path, [name, value]) {
                    return path.replace(new RegExp(`{${name}}`, 'g'), String(value));
                }, config.openapi as string)
                ;
            const res = await fetch.request<R, AxiosResponse<R, D>, D>({
                ...config,
                url,
                params: config.query,
            });
            openapi.node(
                'paths',
                JSON.pointer.escape(config.openapi),
                config.method,
                'responses',
                res.status.toString(),
                'content',
                JSON.pointer.escape(res.mimetype()),
                'schema',
            ).assert(res.data, {
                status: 502,
            });
            return res;
        }
        return Object.assign(invoke, {
            document: openapi,
            axios: fetch,
        });
    },
    mock(fetch: ReturnType<typeof build>) {
        const name = 'nock';// use variable to prevent pkg include this
        const nock = require(name) as typeof import('nock');
        return nock(fetch.defaults.baseURL ?? '');
    },
});
declare module 'axios' {
    interface AxiosRequestConfig {
        /**
        inject tracecontext to header
        */
        readonly tracecontext?: CloudEvent<string>
        /**
        datetime to send this request

        @default Date.now()
        */
        readonly now?: number
    }
    interface AxiosResponse {
        /**
        extract tracecontext from header
        */
        tracecontext(): CloudEvent<string>
        /**
        @return mime type of content
        */
        mimetype(): string
        /**
        how many time to spent
        */
        elapse(): number
    }
}