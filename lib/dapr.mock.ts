import axios from '@io/lib/axios.mock'
import build from '@io/lib/dapr'
export default Object.assign(build, {
    mock(dapr: ReturnType<typeof build>) {
        const mock = axios.mock(dapr);
        return Object.assign(mock, {
            config(store: string) {
                return {
                    get(key: string) {
                        return mock.get(`/v1.0-alpha1/configuration/${store}?key=${key}`);
                    },
                };
            },
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
                        post<V>(url: string, cb: (body: Fetch<V>) => boolean = () => true) {
                            return mock.post('/' + `/v1.0/bindings/${binding}`
                                .split('/')
                                .filter(Boolean)
                                .join('/'), function (body?: Fetch<V>) {
                                    return body?.metadata?.path === url
                                        &&
                                        body?.operation?.toLowerCase() === 'post'
                                        &&
                                        cb(body)
                                        ;
                                });
                        },
                        get(url: string) {
                            return mock.post('/' + `/v1.0/bindings/${binding}`
                                .split('/')
                                .filter(Boolean)
                                .join('/'), function (body?: Fetch<never>) {
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
interface Fetch<V> {
    readonly operation?: string
    readonly data?: V
    readonly metadata?: {
        readonly path?: string
    }
}