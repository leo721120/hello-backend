import express from '@io/app/express'
import path from 'node:path'
import { glob } from 'glob'
import '@io/lib/error'
import '@io/lib/node'
export default express.service(function (app) {
    Object.assign(app, <typeof app>{
        blob(type, cb) {
            this.service('blob').setup(type, cb);
            return this;
        },
    }).get('/blobs', async function (req, res) {
        const tracecontext = req.tracecontext();
        const types = req.querystrings('type');
        const list = await app
            .service('blob')
            .query({ tracecontext })
            .search(...types)
            ;
        res.status(200).json(list);
    }).get('/blobs/:type/:name', async function (req, res) {
        const tracecontext = req.tracecontext();
        const type = req.parameter('type');
        const name = req.parameter('name');
        const list = await app
            .service('blob')
            .query({ tracecontext })
            .search(type)
            ;
        const item = list.find(function (item) {
            return item.name === name;
        });
        if (!item) throw Error.build({
            name: Error.Code.NotFound,
            message: 'blob not found',
            status: 404,
        });
        res.status(200).sendFile(path.join(item.path, name));
    }).service<Service>('blob', function () {
        const map = new Map<string, Search>();

        return {
            setup(type, cb) {
                map.set(type, cb);
                return this;
            },
            query(options) {
                return {
                    async search(...a) {
                        if (!a.length) {
                            const all = map.keys();
                            return this.search(...all);
                        }
                        const list = [] as Record[];
                        const jobs = a.map<[string, Search]>(function (type) {
                            const cb = map.get(type) ?? async function () {
                                return [];
                            };
                            return [type, cb];
                        });
                        for await (const [type, cb] of jobs) {
                            const n = await cb(options).map(function (item) {
                                return { type, ...item };
                            });
                            list.push(...n);
                        }
                        return list;
                    },
                };
            },
        };
    }).blob('log', async function ({ tracecontext }) {
        const path = process.cwd();
        const list = await glob([
            `${path}/*.log.gz`,
            `${path}/*.log`,
        ], {
            ignore: [
                'node_modules/**',
            ],
        });
        {
            tracecontext.servertiming?.('glob');
        }
        return list.map(function (name) {
            return {
                path,
                name,
            };
        });
    });
});
declare global {
    namespace Express {
        interface Application {
            /**
            */
            blob(type: string, cb: Search): this
            service(name: 'blob'): Service
        }
    }
}
interface Model {
    search(...a: readonly string[]): Promise<readonly Record[]>
}
interface Query {
    readonly tracecontext: CloudEvent<string>
}
interface Search {
    /**
    */
    (query: Query): Promise<readonly Record[]>
}
interface Record {
    readonly path: string

    readonly name: string
}
interface Service {
    /**
    */
    setup(type: string, cb: Search): this
    query(options: Query): Model
}