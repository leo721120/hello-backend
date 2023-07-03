import express from '@io/app/express'
import os from 'node:os'
import '@io/lib/error'
import '@io/lib/node'
export default express.service(function (app) {
    Object.assign(app, <typeof app>{
        metric(type, cb) {
            this.service('metric').setup(type, cb);
            return this;
        },
    }).get('/metrics', async function (req, res) {
        const tracecontext = req.tracecontext();
        const types = req.querystrings('type');
        const data = await app
            .service('metric')
            .query({ tracecontext })
            .collect(...types)
            ;
        res.status(200).json(data);
    }).service<Service>('metric', function () {
        const map = new Map<string, Collect>();

        return {
            setup(type, cb) {
                map.set(type, cb);
                return this;
            },
            query(options) {
                return {
                    async collect(...a) {
                        if (!a.length) {
                            const all = map.keys();
                            return this.collect(...all);
                        }
                        const metrics = {
                        };
                        const jobs = a.map<[string, Collect]>(function (type) {
                            const cb = map.get(type) ?? async function () {
                                throw Error.build({
                                    name: Error.Code.NotFound,
                                    message: `there is no ${type} metrics`,
                                    status: 404,
                                });
                            };
                            return [type, cb];
                        });
                        for await (const [type, cb] of jobs) {
                            const o = await cb(options).catch(function (e: Error) {
                                return <rfc7807>{
                                    title: e.name,
                                    status: e.status ?? 500,
                                    detail: e.message,
                                };
                            });
                            Object.assign(metrics, {
                                [type]: o,
                            });
                        }
                        return metrics;
                    },
                };
            },
        };
    }).metric('mem', async function () {// https://stackoverflow.com/questions/12023359/what-do-the-return-values-of-node-js-process-memoryusage-stand-for
        const unit = 1;// bytes
        const mem = process.memoryUsage();
        const sys = {
            totalmem: os.totalmem() / unit,
            freemem: os.freemem() / unit,
        };
        const app = {
            rss: mem.rss / unit,
            totalheap: mem.heapTotal / unit,
            usedheap: mem.heapUsed / unit,
        };
        return {
            sys_freemem: sys.freemem,
            sys_totalmem: sys.totalmem,
            app_rss: app.rss,
            app_usedheap: app.usedheap,
            app_totalheap: app.totalheap,
        };
    });
});
declare global {
    namespace Express {
        interface Application {
            /**
            register a metric collection
            */
            metric(type: string, cb: Collect): this
            service(name: 'metric'): Service
        }
    }
}
interface Model {
    collect(...a: readonly string[]): Promise<object>
}
interface Query {
    readonly tracecontext: CloudEvent<string>
}
interface Collect {
    /**
    @returns metric
    */
    (query: Query): Promise<object>
}
interface Service {
    /**
    register a metric collection
    */
    setup(type: string, cb: Collect): this
    query(options: Query): Model
}