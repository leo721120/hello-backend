import express from '@io/lib/express'
import axios from '@io/lib/axios'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    app.service('apphub/openapi', function () {
        const baseURL = process.env.APPHUB_URL ?? 'http://localhost:9999';
        const timeout = Number.numberify(process.env.APPHUB_TIMEOUT, 5_000);
        const appid = process.env.APPHUB_APPID ?? 'apphub';
        const fetch = axios({
            timeout,
            baseURL,
            headers: {
                'dapr-app-id': appid,
            },
        });
        app.once('close', function () {
            fetch.defaults.httpAgent?.destroy();
            fetch.defaults.httpsAgent?.destroy();
        });
        fetch.interceptors.response.use(function (res) {
            app.emit('event', res.cloudevent());
            return res;
        });
        fetch.interceptors.request.use(function (req) {
            const now = new Date();
            const method = req.method?.toUpperCase() ?? 'GET';
            const cloudevent = CloudEvent({
                ...req.cloudevent,
                source: req.url,
                time: now.toISOString(),
                type: method,
                id: req.cloudevent?.id,
            });
            {
                app.emit('event', cloudevent);
            }
            return Object.assign(req, <typeof req>{
                now: now.getTime(),
                cloudevent,
                method,
            });
        });
        const openapi = axios.openapi(fetch, JSON.schema('apphub/openapi.json',
            JSON.openapi(path.join(__dirname, 'openapi.yml'))
        ));
        return <Service>{
            async login() {
                const res = await openapi<Response<Cert>>({
                    openapi: '/login',
                    method: 'post',
                    data: {
                        username: process.env.APPHUB_USERNAME ?? 'admin',
                        password: process.env.APPHUB_PASSWORD ?? 'admin',
                    },
                });
                return res.data;
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
interface Service {
    login(): Promise<Response<Cert>>
}
interface Cert {
    readonly token: string
}