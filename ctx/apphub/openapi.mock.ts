import { binding, openapi } from './openapi'
import express from '@io/lib/express'
export default express.service(async function (app) {
    const mock = await app.service('mock');
    Object.assign(mock, <typeof mock>{
        apphub: {
            login(status, example) {
                const path = [
                    'paths',
                    JSON.pointer.escape('/login'),
                    'post',
                    'responses',
                    status.toString(),
                    'content',
                    JSON.pointer.escape('application/json'),
                ];
                const exam = example ? openapi.node(
                    ...path,
                    'examples',
                    JSON.pointer.escape(example),
                    'value',
                ) : openapi.node(
                    ...path,
                    'example',
                );
                mock.bindings
                    .fetch(binding)
                    .post('/login')
                    .reply(status, exam.schema as {})
                    ;
                return mock;
            },
        },
    });
});
declare module '@io/app/domain.mock' {
    interface Mock {
        readonly apphub: {
            login(status: number, example?: string): Mock
        }
    }
}