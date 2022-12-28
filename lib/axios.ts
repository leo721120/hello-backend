import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { TraceContext } from '@io/lib/event'
import axios from 'axios'
import mime from 'mime'
import nock from 'nock'
export function build(config?: Readonly<AxiosRequestConfig>) {
    const fetch = axios.create({
        baseURL: 'http://localhost',
        ...config,
    });
    fetch.interceptors.response.use(function (res) {
        const now = Date.now();
        const req = res.config;
        return Object.assign(res, <typeof res>{
            tracecontext() {
                const tracecontext = TraceContext(this.headers?.['traceparent']);
                this.tracecontext = () => tracecontext;
                return tracecontext;
            },
            mimetype() {
                const type = this.headers?.['content-type'];
                const ext = mime.getExtension(type) ?? 'json';
                return mime.getType(ext) ?? 'application/json';
            },
            elapse() {
                return now - (req.now ?? now);
            },
        });
    }, function (e: AxiosError) {
        const res = e.response;
        const req = e.config;
        throw Object.assign(e, <typeof e>{
            name: res?.statusText ?? e.name,
            errno: res?.status ?? e.errno ?? 504,
            params: e.params ?? {
                method: req.method?.toUpperCase() ?? 'GET',
                url: req.url,
                query: req.params,
            },
        });
    });
    fetch.interceptors.request.use(function (req) {
        const now = Date.now();
        const tracecontext = req.tracecontext ?? TraceContext();
        const traceparent = tracecontext.traceparent();
        const headers = {
            ...req.headers,
            traceparent,
        };
        return Object.assign(req, <typeof req>{
            headers,
            now,
        });
    }, function (e: AxiosError) {
        const res = e.response;
        const req = e.config;
        throw Object.assign(e, <typeof e>{
            name: res?.statusText ?? e.name,
            errno: res?.status ?? e.errno ?? 504,
            params: e.params ?? {
                method: req.method?.toUpperCase() ?? 'GET',
                url: req.url,
                query: req.params,
            },
        });
    });
    return Object.assign(fetch, {
    });
};
export default Object.assign(build, {
    mock(fetch: AxiosInstance) {
        return nock(fetch.defaults.baseURL ?? '');
    },
});
declare module 'axios' {
    interface AxiosRequestConfig {
        /**
        inject tracecontext to header
        */
        readonly tracecontext?: TraceContext
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
        tracecontext(): TraceContext
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