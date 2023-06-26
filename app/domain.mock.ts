import express from '@io/app/express'
import dapr from '@io/lib/dapr'
export interface Mock extends ReturnType<typeof dapr.mock> {
}
export default express.service(function (app) {
    app.service('mock', function () {
        const fetch = app.service('dapr');
        return dapr.mock(fetch);
    });
});
declare global {
    namespace Express {
        interface Application {
            /**
            mock object, only for test
            */
            service(name: 'mock'): Mock
        }
    }
}