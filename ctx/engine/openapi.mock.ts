import { binding, openapi } from './openapi'
import express from '@io/lib/express'
export default express.setup(async function (app) {
    const mock = await app.service('mock');
    Object.assign(mock, <typeof mock>{
        engine: {
            addCamera(status, example) {
                const path = [
                    'paths',
                    JSON.pointer.escape('/fr-api/camera'),
                    'post',
                    'responses',
                    status.toString(),
                    'content',
                    JSON.pointer.escape('application/json'),
                ];
                const exam = example ? openapi.child(
                    ...path,
                    'examples',
                    JSON.pointer.escape(example),
                    'value',
                ) : openapi.child(
                    ...path,
                    'example',
                );
                mock.bindings
                    .fetch(binding)
                    // TODO: validate request
                    .post('/fr-api/camera')
                    .reply(status, exam.schema as {})
                    ;
                return mock;
            },
            version(status, example) {
                const path = [
                    'paths',
                    JSON.pointer.escape('/version'),
                    'get',
                    'responses',
                    status.toString(),
                    'content',
                    JSON.pointer.escape('application/json'),
                ];
                const exam = example ? openapi.child(
                    ...path,
                    'examples',
                    JSON.pointer.escape(example),
                    'value',
                ) : openapi.child(
                    ...path,
                    'example',
                );
                mock.bindings
                    .fetch(binding)
                    // TODO: validate request
                    .get('/version')
                    .reply(status, exam.schema as {})
                    ;
                return mock;
            },
        },
    });
});
declare module '@io/app/mock' {
    interface Mock {
        readonly engine: {
            addCamera(status: number, example?: string): Mock
            version(status: number, example?: string): Mock
        }
    }
}