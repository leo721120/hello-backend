import { binding, openapi } from './openapi'
import express from '@io/lib/express'
export default express.service(async function (app) {
    const mock = await app.service('mock');
    Object.assign(mock, <typeof mock>{
        license: {
            version(status, example) {
                const path = [
                    'paths',
                    JSON.pointer.escape('/api/server/info'),
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
                    .get('/api/server/info')
                    .reply(status, exam.schema as {})
                    ;
                return mock;
            },
        },
    });
});
declare module '@io/app/mock' {
    interface Mock {
        readonly license: {
            version(status: number, example?: string): Mock
        }
    }
}