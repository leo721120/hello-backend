import express from '@io/app/express'
import dapr from '@io/lib/dapr'
import '@io/lib/event'
import '@io/lib/node'
export interface Dapr extends ReturnType<typeof dapr> {
}
export default express.service(function (app) {
    app.service('dapr', function () {
        const timeout = Number
            .numberify(process.env.DAPR_TIMEOUT)
            .default(3_000)
            ;
        const port = Number
            .numberify(process.env.DAPR_HTTP_PORT)
            .default(3500)
            ;
        const fetch = dapr({
            // sidecar should be localhost
            baseURL: `http://localhost:${port}`,
            timeout,
            onres(axios) {
                axios.interceptors.response.use(function (res) {
                    app.emit('event', res.tracecontext());
                    return res;
                });
                return axios;
            },
            onreq(axios) {
                axios.interceptors.request.use(function (req) {
                    app.emit('event', req.tracecontext!);
                    return req;
                });
                return axios;
            },
        });
        return fetch;
    }).get('/dapr/config', function (req, res) {
        res.status(200).json({});
    }).get('/dapr/metadata', async function (req, res) {
        const tracecontext = req.tracecontext();
        const dapr = app.service('dapr');
        const metadata = await dapr.metadata({ tracecontext });
        res.status(200).json(metadata.data);
    });
});
declare global {
    namespace NodeJS {
        // https://docs.dapr.io/reference/environment/
        interface ProcessEnv {
            /**
            the port that Dapr sends its metrics information to
            */
            readonly DAPR_METRICS_PORT?: string
            /**
            the HTTP port for Dapr to listen on
            */
            readonly DAPR_HTTP_PORT?: string
            /**
            the gRPC port for Dapr to listen on
            */
            readonly DAPR_GRPC_PORT?: string
            /**
            milliseconds before the request times out
            */
            readonly DAPR_TIMEOUT?: string
            /**
            the port your application is listening on
            */
            readonly APP_PORT?: string
            /**
            the id for your application, used for service discovery
            */
            readonly APP_ID?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'dapr'): Dapr
        }
    }
}