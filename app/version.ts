import manifest from '@io/lib/manifest'
import express from '@io/app/express'
import os from 'node:os'
export default express.service(function (app) {
    Object.assign(app, <typeof app>{
        version(type, cb) {
            this.service('version').setup(type, cb);
            return this;
        },
    }).get('/version', async function (req, res) {
        const tracecontext = req.tracecontext();
        const version = await app
            .service('version')
            .query({ tracecontext })
            .select()
            ;
        res.status(200).json(version);
    }).service<Service>('version', function () {
        const map = new Map<string, Search>();

        return {
            setup(type, cb) {
                map.set(type, cb);
                return this;
            },
            query(options) {
                return {
                    async select(...a) {
                        if (!a.length) {
                            const all = map.keys();
                            return this.select(...all);
                        }
                        const o = {
                        };
                        for await (const type of a) {
                            const b = await map.get(type)?.(options);
                            Object.assign(o, b ?? {});
                        }
                        return o;
                    },
                };
            },
        };
    }).version('app', async function () {
        return {
            backend: manifest.version,
            hostname: os.hostname(),
            os: os.version(),
        };
    })
});
declare global {
    namespace Express {
        interface Application {
            version(type: string, cb: Search): this
            service(name: 'version'): Service
        }
    }
}
interface Model {
    select(...a: readonly string[]): Promise<object>
}
interface Query {
    readonly tracecontext: CloudEvent<string>
}
interface Search {
    (query: Query): Promise<object>
}
interface Service {
    /**
    setup callback to query version information for subsystem
    */
    setup(type: string, cb: Search): this
    /**
    query version information from selected subsystem
    */
    query(options: Query): Model
}