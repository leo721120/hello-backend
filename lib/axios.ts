import type { AxiosError, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import mime from 'mime'
import '@io/lib/event'
import '@io/lib/error'
export function build(config?: Readonly<AxiosRequestConfig>) {
    const fetch = axios.create({
        baseURL: 'http://localhost',
        ...config,
    });
    fetch.interceptors.response.use(function (res) {
        const now = new Date();
        const req = res.config;
        return Object.assign(res, <typeof res>{
            cloudevent() {
                const e = CloudEvent({
                    id: this.headers?.['traceparent'] ?? req.cloudevent?.id,
                    type: this.status.toString(),
                    time: now.toISOString(),
                    source: req.url,
                    elapse: this.elapse(),
                });
                this.cloudevent = () => {
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
    }, function (e: AxiosError) {
        const res = e.response;
        const req = e.config;
        throw Error.$({
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
        const cloudevent = CloudEvent({
            ...req.cloudevent,
            source: req.url ?? '/',
            type: method,
            id: req.cloudevent?.id,// or generate new one
        });
        const headers = {
            ...req.headers,
            traceparent: cloudevent.id,
        };
        return Object.assign(req, <typeof req>{
            cloudevent,
            headers,
            method,
            now,
        });
    }, function (e: AxiosError) {
        const res = e.response;
        const req = e.config;
        throw Error.$({
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
    return fetch;
};
export default Object.assign(build, {
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
        readonly cloudevent?: CloudEvent<string>
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
        cloudevent(): CloudEvent<string>
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