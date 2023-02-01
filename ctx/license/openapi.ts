import express from '@io/lib/express'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export const binding = process.env.LICENSESRV_APPNAME ?? 'license-server';
export const openapi = JSON.schema('license/openapi.json',
    JSON.openapi(path.join(__dirname, 'openapi.yml'))
);
export default express.service(function (app) {
    app.service('license/openapi', function () {
        return <Service>{
            async version() {
                const dapr = await app.service('dapr');
                const res = await dapr.bindings.fetch<Response<Version>>({
                    url: '/api/server/info',
                    binding,
                });
                openapi.child(
                    'paths',
                    JSON.pointer.escape('/api/server/info'),
                    'get',
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
            readonly LICENSESRV_APPNAME?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'license/openapi'): Promise<Service>
        }
    }
}
type Response<V extends object> = V & {
    readonly error_code: '0' | string
    readonly error_message?: string
};
interface Service {
    /**
    version of service
    */
    version(): Promise<Response<Version>>
}
interface Version {
    readonly version: string
}