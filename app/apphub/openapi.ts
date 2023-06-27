import express from '@io/app/express'
import axios from '@io/lib/axios'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    app.service<Service>('apphub/openapi', function () {
        const baseURL = process.env.APPHUB_URL ?? 'http://localhost:9999';
        const appid = process.env.APPHUB_APPID ?? 'apphub';
        const dapr = app.service('dapr');
        const timeout = Number
            .numberify(process.env.APPHUB_TIMEOUT)
            .default(5_000)
            ;
        const fetch = dapr.axios({
            baseURL,
            timeout,
            headers: {
                'dapr-app-id': appid,
            },
        });
        const openapi = axios.openapi(fetch, JSON.schema('apphub/openapi.json',
            JSON.openapi(path.join(__dirname, 'openapi.yml'))
        ));
        return {
            invoke(params) {
                return {
                    async login() {
                        const res = await openapi<Response<Cert>>({
                            tracecontext: params.tracecontext,
                            openapi: '/login',
                            method: 'post',
                            data: {
                                username: process.env.APPHUB_USERNAME ?? 'admin',
                                password: process.env.APPHUB_PASSWORD ?? 'admin',
                            },
                        });
                        return res.data;
                    },
                }
            },
        };
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            @default apphub
            */
            readonly APPHUB_APPID?: string
            /**
            @default http://localhost:9999
            */
            readonly APPHUB_URL?: string
            /**
            in milliseconds
            
            @default 5000
            */
            readonly APPHUB_TIMEOUT?: string
            /**
            @default admin
            */
            readonly APPHUB_USERNAME?: string
            /**
            @default admin
            */
            readonly APPHUB_PASSWORD?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'apphub/openapi'): Service
        }
    }
}
type Response<V extends object> = V & {
    readonly status: 'CHANGED' | 'CONTENT'
};
interface Cert {
    readonly token: string
}
interface Query {
    readonly tracecontext?: CloudEvent<string>
}
interface Control {
    login(): Promise<Response<Cert>>
}
interface Service {
    invoke(params: Query): Control
}