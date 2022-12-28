import express from '@io/lib/express'
import dapr from '@io/lib/dapr'
export interface Mock extends ReturnType<typeof dapr.mock> {
}
export default express.setup(function (app) {
    app.service('mock', async function () {
        const fetch = await app.service('dapr');
        return dapr.mock(fetch);
    });
});
declare global {
    namespace Express {
        interface Application {
            /**
            mock object, only for test
            */
            service(name: 'mock'): Promise<Mock>
        }
    }
}