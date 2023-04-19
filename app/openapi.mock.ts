import type { IPrismHttpServer } from '@stoplight/prism-http-server/dist/types'
import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(async function (app) {
    const mock = app.service('mock');
    Object.assign(mock, <typeof mock>{
        async openapi(document) {
            const stoplight = '@stoplight/prism-cli/dist/util/createServer';
            const { createSingleProcessPrism } = await import(stoplight) as typeof import('@stoplight/prism-cli/dist/util/createServer');
            const server: IPrismHttpServer = await createSingleProcessPrism({
                document,
                dynamic: false,
                cors: false,
                host: 'localhost',
                port: 0,// random port number
                multiprocess: false,
                errors: true,
                verboseLevel: 'info',
            });
            app.once('close', function () {
                server.close();
            });
            return Object.assign(server, <typeof server>{
            });
        },
    });
});
declare module '@io/app/domain.mock' {
    interface Mock {
        openapi(document: string): Promise<IPrismHttpServer>
    }
}
declare module '@stoplight/prism-http-server/dist/types' {
    interface IPrismHttpServer {
        addr(): string
    }
}
{// hacking to get server port number
    const script = '@stoplight/prism-http-server/dist/server';
    const hotfix = require(script) as typeof import('@stoplight/prism-http-server/dist/server');
    Object.assign(hotfix, <typeof hotfix>{
        createServer: Function.monkeypatch(hotfix.createServer, function (createServer) {
            return function (...a) {
                const server = createServer.call(hotfix, ...a);
                {
                    server.listen = Function.monkeypatch(server.listen, function (listen) {
                        return async function (...a) {
                            const addr = await listen.call(server, ...a);
                            {// return addr to find current port number
                                server.addr = () => addr;
                            }
                            {
                                if (addr.includes('::1:')) {// correct ipv6 format (http://::1:54366)
                                    const ipv6 = addr.replace('::1:', '[::1]:');
                                    server.addr = () => ipv6;
                                }
                            }
                            return addr;
                        };
                    });
                }
                return server;
            };
        }),
    });
}