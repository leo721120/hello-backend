import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.service('manifest', function () {
        const path = require.resolve('../package.json');
        const data = require(path) as Record<string, unknown>;
        return Object.pick(data, 'version');
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'manifest'): Promise<Manifest>
        }
    }
}
interface Manifest {
    /**
    version for application
    */
    readonly version: string
    /**
    */
    readonly limit?: {
    }
}