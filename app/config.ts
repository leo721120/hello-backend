import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
    const path = require.resolve('../package.json');
    const manifest = require(path) as typeof process.manifest & {
        /**
        fixed settings
        */
        readonly env?: Readonly<typeof process.env>
    };
    Object.assign(process, <typeof process>{
        manifest,
    });
    Object.assign(process.env, {
        ...manifest.env,
    });
});
declare global {
    namespace NodeJS {
        interface Process {
            /**
            application fixed settings

            @default package.json
            */
            readonly manifest: {
                readonly name: string
                /**
                version for application
                */
                readonly version: string
            }
        }
    }
}