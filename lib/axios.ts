import type { AxiosError, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import mime from 'mime'
import '@io/lib/event'
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
                    type: req.method ?? 'GET',
                    time: now.toISOString(),
                    data: undefined,
                    source: req.url,
                    status: this.status,
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
        throw Object.assign(e, <typeof e>{
            name: res?.statusText ?? e.name,
            errno: res?.status ?? e.errno ?? 504,
            params: e.params ?? {
                method: req.method,
                url: req.url,
                query: req.params,
            },
        });
    });
    fetch.interceptors.request.use(function (req) {
        const now = Date.now();
        const headers = {
            ...req.headers,
            traceparent: req.cloudevent?.id ?? CloudEvent({
                data: undefined,
                type: '',
                time: '',
            }).id,
        };
        return Object.assign(req, <typeof req>{
            method: req.method?.toUpperCase() ?? 'GET',
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
                method: req.method,
                url: req.url,
                query: req.params,
            },
        });
    });
    return Object.assign(fetch, {
    });
};
export default Object.assign(build, {
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