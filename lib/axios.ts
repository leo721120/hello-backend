import type { AxiosRequestConfig } from 'axios'
import type { AxiosResponse } from 'axios'
import type { AxiosError } from 'axios'
import https from 'node:https'
import http from 'node:http'
import axios from 'axios'
import mime from 'mime'
import '@io/lib/event'
import '@io/lib/error'
import '@io/lib/json'
export function build(options?: Readonly<AxiosRequestConfig<never>>) {
    const httpsAgent = new https.Agent(options?.connection);
    const httpAgent = new http.Agent(options?.connection);
    const fetch = axios.create({
        httpsAgent,
        httpAgent,
        baseURL: 'http://localhost',
        timeout: 60_000,
        ...options,
    });
    fetch.interceptors.response.use(function (res) {
        const now = new Date();
        const req = res.config;
        return Object.assign(res, <typeof res>{
            tracecontext() {
                const e = CloudEvent({
                    id: this.headers?.['traceparent'] ?? req.tracecontext?.id,
                    type: this.status.toString(),
                    time: now.toISOString(),
                    source: req.url ?? '/',
                    elapse: this.elapse(),
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
    }, function (e: Readonly<AxiosError>) {
        const res = e.response;
        const req = e.config;
        throw Error.build({
            message: e.message,
            name: e.code ?? res?.statusText ?? e.name,
            errno: e.errno,
            status: res?.status ?? 504,
            reason: res?.data,
            params: e.params ?? {
                method: req.method,
                url: req.url,
                query: req.params,
            },
        });
    });
    fetch.interceptors.request.use(function (req) {
        const now = req.now ?? Date.now();
        const method = req.method?.toUpperCase() ?? 'GET';
        const tracecontext = CloudEvent({
            ...req.tracecontext,
            source: req.url ?? '/',
            type: method,
            id: req.tracecontext?.id,// or generate new one
        });
        const headers = {
            ...req.headers,
            traceparent: tracecontext.id,
        };
        return Object.assign(req, <typeof req>{
            tracecontext,
            headers,
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
                method: req.method,
                url: req.url,
                query: req.params,
            },
        });
    });
    return Object.assign(options?.intercepte?.(fetch) ?? fetch, {
        /**
        create new instance with merged options
        */
        axios(params: Readonly<AxiosRequestConfig<never>>) {
            return build({
                ...options,
                ...params,
            });
        },
        /**
        release connection pools
        */
        close() {
            fetch.defaults.httpsAgent?.destroy();
            fetch.defaults.httpAgent?.destroy();
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
        used to setup http(s).Agent at creation, no use for request
        */
        readonly connection?: https.AgentOptions
        /**
        used to setup interceptors at creation, no use for request
        */
        intercepte?(axios: AxiosInstance): typeof axios
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