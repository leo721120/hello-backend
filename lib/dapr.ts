import type { AxiosError, AxiosRequestConfig } from 'axios'
import axios from '@io/lib/axios'
export function build(config?: Readonly<AxiosRequestConfig>) {
    const fetch = axios(config);
    //
    return Object.assign(fetch, {
        config(req: Omit<AxiosRequestConfig<never>, 'baseURL' | 'url' | 'method' | 'data' | 'params'> & {
            /**
            name of config store
            */
            readonly configstore: string
            /**
            key to config
            */
            readonly key: string
        }) {
            interface KeyValue {
                readonly key: typeof req['key']
                readonly value: string
            }
            return fetch.request<readonly KeyValue[] & Fail>({
                ...req,
                url: `/v1.0-alpha1/configuration/${req.configstore}`,
                method: 'GET',
                params: { key: req.key },
            });
        },
        secret<V = unknown, A = unknown>(req: Omit<AxiosRequestConfig<A>, 'baseURL' | 'url' | 'method' | 'data'> & {
            /**
            name of secret store
            */
            readonly secretstore: string
            /**
            key to secret
            */
            readonly key: string
        }) {
            return fetch.request<V & Fail>({
                ...req,
                url: `/v1.0/secrets/${req.secretstore}/${req.key}`,
                method: 'GET',
            });
        },
        invoke<V = unknown, A = unknown>(req: AxiosRequestConfig<A> & {
            readonly appid: string
            /**
            method to invoke
            */
            readonly url: string
        }) {
            const url = req.url
                .split('/')
                .filter(Boolean)
                .join('/')
                ;
            return fetch.request<V>({
                ...req,
                url: `/v1.0/invoke/${req.appid}/method/${url}`,
            });
        },
        publish(ev: CloudEvent<string> & {
            readonly pubsubname: string
            /**
            event topic
            */
            readonly topic: string
        }) {
            return fetch.request<{
                readonly status: 'SUCCESS'
            }>({
                url: `/v1.0/publish/${ev.pubsubname}/${ev.topic}`,
                validateStatus: null,
                cloudevent: ev,
                method: 'POST',
                data: ev,
                params: {// just for log, not for function
                    event: ev.type,
                },
                headers: {
                    'content-type': 'application/cloudevents+json',
                },
            });
        },
        bindings: {
            async fetch<V = unknown, A = unknown>(req: AxiosRequestConfig<A> & {
                readonly binding: string
                /**
                path to call
                */
                readonly url: string
            }) {
                return fetch.request<V & Fail>({
                    ...req,
                    url: `/v1.0/bindings/${req.binding}`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    data: {
                        operation: req.method ?? 'get',
                        data: req.data,
                        metadata: {
                            path: req.url,
                        },
                    },
                }).catch(function (e: AxiosError<Fail | undefined>) {
                    throw Object.assign(e, <typeof e>{
                        message: e.response?.data?.message ?? e.message,
                        name: e.response?.data?.errorCode ?? e.name,
                    });
                });
            },
        },
        metadata(options?: AxiosRequestConfig) {
            return fetch.request<Metadata>({
                ...options,
                url: '/v1.0/metadata',
            });
        },
    });
}
export default Object.assign(build, {
});
interface Metadata {
    readonly id: string
    readonly components?: readonly []
    readonly actors?: readonly []
    readonly extended?: {
        readonly daprRuntimeVersion?: string
    }
}
interface Fail {
    readonly message?: string
    readonly errorCode?:
    | 'ERR_INVOKE_OUTPUT_BINDING'
    // 400, error configuration stores {name} not found
    | 'ERR_CONFIGURATION_STORE_NOT_FOUND'
    // 500, fail to get {key} from Configuration store configstore
    | 'ERR_CONFIGURATION_GET'
    | 'ERR_SECRET_GET'
}