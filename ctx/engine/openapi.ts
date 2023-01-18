import express from '@io/lib/express'
import form from 'form-data'
import path from 'node:path'
import '@io/lib/node'
import '@io/lib/json'
export const binding = process.env.ENGINE_APPNAME ?? 'engine';
export const openapi = JSON.schema('engine/openapi.json',
    JSON.openapi(path.join(__dirname, 'openapi.yml'))
);
export default express.setup(function (app) {
    app.service('engine/openapi', function () {
        return <Engine>{
            async addCamera(camera) {
                const formdata = Object.entries(camera).reduce(function(form, [name, value]) {
                    form.append(name, value);
                    return form;
                }, new form());

                const dapr = await app.service('dapr');
                const res = await dapr.bindings.fetch<Response>({
                    method: 'POST',
                    url: '/fr-api/camera',
                    data: formdata.getBuffer(),
                    headers: formdata.getHeaders(),
                    binding,
                });
                openapi.child(
                    'paths',
                    JSON.pointer.escape('/fr-api/camera'),
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
            async version() {
                const dapr = await app.service('dapr');
                const res = await dapr.bindings.fetch<Response>({
                    method: 'GET',
                    url: '/version',
                    binding,
                });
                openapi.child(
                    'paths',
                    JSON.pointer.escape('/version'),
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
            name of service to invoke
            */
            readonly ENGINE_APPNAME?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'engine/openapi'): Promise<Engine>
        }
    }
}
interface Version {
    readonly product: {
        readonly name: string
        readonly version: string
    }
    readonly engine: {
        readonly name: string
        readonly version: string
    }
}
interface Region {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
interface Camera {
    readonly id: string;
    readonly name: string;
    readonly url: string;
    readonly iFrameOnly?: boolean;
    readonly captureInterval?: number;
    readonly mergeThreshold?: number;
    readonly mergeInterval?: number;
    readonly maxFaceCount?: number;
    readonly minFaceWidth?: number;
    readonly maxFaceWidth?: number;
    readonly roi?: readonly Region[];
    readonly attribute?: boolean;
    readonly resultCount?: number;
}
enum ErrorCode {
    GenericError = -1,
    RequestIsInvalid = -2,
    ActivateLicenseFailed = -3,
    SetCapacityFailed = -4,
    RequestNotFoundInDb = -5,
    WriteToDbFailed = -6,
    StartStreamingFailed = -7,
    StopStreamingFailed = -8,
    RecognizeFailed = -9,
    NoFaceInImage = -10,
    MaskNotSupport = -11,
    FaceTooSmall = -12,
    FaceTooLarge = -13,
    FaceNotInRegion = -14,
    FacePoseOffAngle = -15,
    FaceOverMaxCount = -16,
};
type Response<V extends object = {}> = V & {
    readonly status?: ErrorCode
    readonly error?: string
};
interface Engine {
    addCamera(camera: Partial<Camera> & Pick<Required<Camera>, 'name' | 'url' | 'maxFaceCount'>): Promise<Response<Pick<Camera, 'id'>>>
    version(): Promise<Response<Version>>
}