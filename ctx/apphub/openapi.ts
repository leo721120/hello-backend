import express from '@io/lib/express'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export const binding = process.env.APPHUB_APPNAME ?? 'apphub';
export const openapi = JSON.schema('apphub/openapi.json',
    JSON.openapi(path.join(__dirname, 'openapi.yml'))
);
export default express.setup(function (app) {
    app.service('apphub/openapi', function () {
        return <Service>{
            async login() {
                const dapr = await app.service('dapr');
                const res = await dapr.bindings.fetch<Response<Cert>>({
                    method: 'POST',
                    url: '/login',
                    binding,
                });
                openapi.child(
                    'paths',
                    JSON.pointer.escape('/login'),
                    'post',
                    'responses',
                    res.status.toString(),
                    'content',
                    JSON.pointer.escape(res.mimetype()),
                    'schema',
                ).assert(res.data, {
                    errno: 504,
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
            name of application to invoke
            */
            readonly APPHUB_APPNAME?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'apphub/openapi'): Promise<Service>
        }
    }
}
type Response<V extends object> = V & {
    readonly status: 'CHANGED' | 'CONTENT'
};
interface Service {
    /**
    retrieve access token
    */
    login(): Promise<Response<Cert>>
}
interface Cert {
    readonly token: string
}