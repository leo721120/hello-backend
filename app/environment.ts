import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.service('environment', function () {
        const path = require.resolve('../package.json');
        const data = require(path) as Record<string, unknown>;
        return Object.pick(data,
            'defaults',
            'version',
        );
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'environment'): Promise<Environment>
        }
    }
}
interface Environment {
    /**
    version for application
    */
    readonly version: string
    /**
    */
    readonly defaults?: {
    }
}