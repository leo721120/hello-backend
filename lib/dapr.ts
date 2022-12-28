import type { AxiosError, AxiosRequestConfig } from 'axios'
import axios from '@io/lib/axios'
export function build(config?: Readonly<AxiosRequestConfig>) {
    const fetch = axios(config);
    //
    return Object.assign(fetch, {
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
            const url = `/v1.0/invoke/${req.appid}/method/${req.url}`
                .split('/')
                .filter(Boolean)
                .join('/')
                ;
            return fetch.request<V>({
                ...req,
                url,
            });
        },
        publish(ev: CloudEvent<string, unknown> & {
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
                tracecontext: ev.tracecontext,
                validateStatus: null,
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
    mock(dapr: ReturnType<typeof build>) {
        const mock = axios.mock(dapr);
        return Object.assign(mock, {
            secret(store: string) {
                return {
                    get(key: string) {
                        return mock.get(`/v1.0/secrets/${store}/${key}`);
                    },
                };
            },
            invoke(appid: string) {
                return {
                    delete(url: string) {
                        return mock.delete('/' +
                            `/v1.0/invoke/${appid}/method/${url}`
                                .split('/')
                                .filter(Boolean)
                                .join('/')
                        );
                    },
                    patch(url: string) {
                        return mock.patch('/' +
                            `/v1.0/invoke/${appid}/method/${url}`
                                .split('/')
                                .filter(Boolean)
                                .join('/')
                        );
                    },
                    post(url: string) {
                        return mock.post('/' +
                            `/v1.0/invoke/${appid}/method/${url}`
                                .split('/')
                                .filter(Boolean)
                                .join('/')
                        );
                    },
                    put(url: string) {
                        return mock.put('/' +
                            `/v1.0/invoke/${appid}/method/${url}`
                                .split('/')
                                .filter(Boolean)
                                .join('/')
                        );
                    },
                    get(url: string) {
                        return mock.get('/' +
                            `/v1.0/invoke/${appid}/method/${url}`
                                .split('/')
                                .filter(Boolean)
                                .join('/')
                        );
                    },
                };
            },
            publish(pubsubname: string) {
                return {
                    post(topic: string) {
                        return mock.post('/' +
                            `/v1.0/publish/${pubsubname}/${topic}`
                                .split('/')
                                .filter(Boolean)
                                .join('/')
                        ).query(true)
                    },
                };
            },
            bindings: {
                fetch(binding: string) {
                    return {
                        post(url: string) {
                            return mock.post('/' + `/v1.0/bindings/${binding}`
                                .split('/')
                                .filter(Boolean)
                                .join('/'), function (body?: Fetch) {
                                    return body?.metadata?.path === url
                                        &&
                                        body?.operation?.toLowerCase() === 'post'
                                        ;
                                });
                        },
                        get(url: string) {
                            return mock.post('/' + `/v1.0/bindings/${binding}`
                                .split('/')
                                .filter(Boolean)
                                .join('/'), function (body?: Fetch) {
                                    return body?.metadata?.path === url
                                        &&
                                        body?.operation?.toLowerCase() === 'get'
                                        ;
                                });
                        },
                    };
                },
            },
            metadata() {
                return mock.get('/v1.0/metadata')
            },
        });
    },
});
interface Metadata {
    readonly id: string
    readonly components?: readonly []
    readonly actors?: readonly []
    readonly extended?: {
        readonly daprRuntimeVersion?: string
    }
}
interface Fetch {
    readonly operation?: string
    readonly metadata?: {
        readonly path?: string
    }
}
interface Fail {
    readonly message?: string
    readonly errorCode?:
    | 'ERR_INVOKE_OUTPUT_BINDING'
}