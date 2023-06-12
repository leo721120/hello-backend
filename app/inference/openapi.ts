import express from '@io/lib/express'
import axios from '@io/lib/axios'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export namespace Value {
    export interface Result {
        readonly label: number | 0 | 9999
        // confidence
        readonly conf: number | 0.0 | 1.0
        readonly x: number | 0.0 | 1.0
        readonly y: number | 0.0 | 1.0
        readonly w: number | 0.0 | 1.0
        readonly h: number | 0.0 | 1.0
    }
    export interface Model {
        readonly mid: string | 'QRmPG9kJ'
        readonly name?: string
        readonly description?: string
        readonly version?: string | '20230202001'
        readonly format?: string | 'yolo'
        readonly ref_pics?: number | 2
        readonly input_width?: number | 512
        readonly input_height?: number | 512
        //readonly labels: readonly InferenceModelLabel[]
    }
}
export default express.service(function (app) {
    app.service<Service>('inference/openapi', function () {
        const timeout = Number.numberify(process.env.INFERENCE_TIMEOUT, 5_000);
        const dapr = app.service('dapr');
        const appid = process.env.INFERENCE_APPID
            ?? 'inference-engine'
            ;
        const apikey = process.env.INFERENCE_APIKEY
            ?? 'unknown-apikey'
            ;
        const baseURL = process.env.INFERENCE_URL
            ?? 'http://localhost:8012'
            ;
        const fetch = dapr.axios({
            timeout,
            baseURL,
            headers: {
                'dap-app-id': appid,
            },
        });
        const openapi = axios.openapi(fetch, JSON.schema('inference/openapi.json',
            JSON.openapi(path.join(__dirname, 'openapi.yml'))
        ));
        return {
            invoke(query) {
                apikey;// no use for now

                return {
                    async predict(params) {
                        const res = await openapi.axios.postForm<Awaited<ReturnType<typeof this.predict>>>(`/api/predict/${params.mid}`, {
                            image: params.img,
                        }, {
                            tracecontext: query.tracecontext,
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
            @default inference-engine
            */
            readonly INFERENCE_APPID?: string
            /**
            url to inference engine

            @default http://localhost:8012
            */
            readonly INFERENCE_URL?: string
            /**
            apikey to do authentication to inference engine

            @default read value from `process.manifest`
            */
            readonly INFERENCE_APIKEY?: string
            /**
            milliseconds before the request times out

            @default 5_000
            */
            readonly INFERENCE_TIMEOUT?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'inference/openapi'): Service
        }
    }
}
type Fail = {
    readonly status: 0

    readonly error_code: number

    readonly error_message: string
};
type Reply<V extends object> = Fail | (V & {
    readonly status: 1
});
interface Query {
    readonly tracecontext?: CloudEvent<string>
}
interface Control {
    predict(params: {
        /**
        dnn model to use for prediction
        */
        readonly mid: Value.Model['mid']
        /**
        image to predict
        */
        readonly img: NodeJS.ReadableStream
    }): Promise<Reply<{
        readonly results: readonly Value.Result[]
    }>>
}
interface Service {
    invoke(query: Query): Control
}