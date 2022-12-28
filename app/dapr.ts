import express from '@io/lib/express'
import dapr from '@io/lib/dapr'
import http from 'node:http'
export interface Dapr extends ReturnType<typeof dapr> {
}
export default express.setup(function (app) {
    const timeout = Number.numberify(process.env.DAPR_TIMEOUT, 3_000);
    const port = Number.numberify(process.env.DAPR_HTTP_PORT, 3500);
    const httpAgent = new http.Agent({
        keepAliveMsecs: 30_000,
        keepAlive: true,
    });
    const fetch = dapr({
        // sidecar should be localhost
        baseURL: `http://localhost:${port}`,
        timeout,
        httpAgent,
    });
    fetch.interceptors.response.use(function (res) {
        app.emit('event', {
            name: res.tracecontext().traceparent(),
            elapse: res.elapse,
            status: res.status,
        });
        return res;
    });
    fetch.interceptors.request.use(function (req) {
        app.emit('event', {
            name: req.tracecontext?.traceparent(),
            method: req.method,
            url: req.url,
            query: req.params,
        });
        return req;
    });
    app.service('dapr', function () {
        return fetch;
    }).once('close', function () {
        // close keep-alived connections
        httpAgent.destroy();
    }).get('/dapr/config', function (req, res) {
        res.status(200).json({});
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
            service(name: 'dapr'): Promise<Dapr>
        }
    }
}