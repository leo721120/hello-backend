import express from '@io/app/express'
import '@io/lib/node'
export default express.service(function (app) {
    Object.assign(app, <typeof app>{
        health(type, cb) {
            this.service('health').setup(type, cb);
            return this;
        },
    }).get('/health', async function (req, res) {
        const tracecontext = req.tracecontext();
        const types = req.querystrings('type');
        const list = await app.service('health')
            .query({ tracecontext })
            .check(...types)
            ;
        const code = list.find(function (result: Partial<Failure>) {
            return !!result.reason;
        }) ? 207 : 200
            ;
        res.status(code).json(list);
    }).service<Service>('health', function () {
        const map = new Map<string, Check>();

        return {
            setup(type, cb) {
                map.set(type, cb);
                return this;
            },
            query(options) {
                return {
                    async check(...a) {
                        if (!a.length) {
                            const all = map.keys();
                            return this.check(...all);
                        }
                        return Promise.all(
                            a.map(function (type) {
                                return map
                                    .get(type)
                                    ?.(options)
                                    .then(function (a) {
                                        return <Success>{
                                            type,
                                            detail: a,
                                        };
                                    })
                                    .catch(function (e: Error) {
                                        return <Failure>{
                                            type,
                                            reason: {
                                                title: e.name,
                                                status: e.status ?? 500,
                                                detail: e.message,
                                            },
                                        };
                                    }) ?? Promise.resolve(<Failure>{
                                        type,
                                        reason: {
                                            title: Error.Code.NotFound,
                                            status: 404,
                                            detail: `there is no health check for ${type}`,
                                        },
                                    });
                            })
                        );
                    },
                };
            },
        };
    });
});
declare global {
    namespace Express {
        interface Application {
            /**
            register a health check
            */
            health(type: string, cb: Check): this
            service(name: 'health'): Service
        }
    }
}
interface Success {
    readonly type: string
    readonly detail: object
}
interface Failure {
    readonly type: string
    readonly reason: rfc7807
}
interface Model {
    check(...a: readonly string[]): Promise<readonly (Success | Failure)[]>
}
interface Query {
    readonly tracecontext: CloudEvent<string>
}
interface Check {
    /**
    @throws {Error} if unhealthy
    @returns information
    */
    (query: Query): Promise<object>
}
interface Service {
    /**
    register a health check
    */
    setup(type: string, cb: Check): this
    query(options: Query): Model
}