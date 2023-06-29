import express from '@io/app/express'
import '@io/lib/error'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/authorize', async function (req, res) {
        const tracecontext = req.tracecontext();
        const user = await req.authenticate();
        const iam = app.service('iam');
        await iam.is(user)
            .can('list:users')
            .for('uid-01', 'uid-02')
            .in({ tracecontext })
            ;
        res.status(200).end();
    }).service<Authorizer>('iam', function () {
        const iam = new Map<string, Authorize>();

        return {
            at(action, authorize) {
                iam.set(action, authorize);
                return this;
            },
            is(user) {
                const map = Object.assign(new Map<string, Authorization>(), {
                    got(key: string) {
                        const v = map.get(key);
                        console.assert(!!v);
                        return v!;
                    },
                });
                return {
                    can(action) {
                        map.set(action, {
                            items: [],
                        });
                        return {
                            in(condition) {
                                const info = map.got(action);
                                Object.assign(info, <typeof info>condition);
                                return this;
                            },
                            for(...items) {
                                const info = map.got(action);
                                Object.assign(info, <typeof info>{
                                    items,
                                });
                                return this;
                            },
                            then(done?, fail?) {
                                return Promise.try(async function () {
                                    const list = [...map.entries()];

                                    for await (const [action, auth] of list) {
                                        const cb = iam.get(action) ?? function () {
                                            throw Error.build({
                                                message: `${action} not allowed`,
                                                name: 'NotAllowed',
                                                status: 403,
                                                params: { action },
                                                reason: 'there is no authorize handler, default is deny',
                                            });
                                        };
                                        await cb(user, auth).then(function () {
                                            app.emit('event', {
                                                ...auth.tracecontext,
                                                source: `/authorize/${action}`,
                                                type: 'Authorize.Allowed',
                                                data: {
                                                    action,
                                                    user,
                                                    auth,
                                                },
                                            });
                                        }, function (e: Error) {
                                            app.emit('event', {
                                                ...auth.tracecontext,
                                                source: `/authorize/${action}`,
                                                type: 'Authorize.Denied',
                                                data: {
                                                    reason: e,
                                                    action,
                                                    user,
                                                    auth,
                                                },
                                            });
                                            throw e;
                                        }).finally(function() {
                                            auth.tracecontext?.servertiming?.('authorize');
                                        });
                                    }
                                }).then(done, fail);
                            },
                        };
                    },
                };
            },
        };
    });
    Object.assign(app, <typeof app>{
        authorize(action, cb) {
            this.service('iam').at(action, cb);
            return this;
        },
    });
});
declare global {
    namespace Express {
        interface Application {
            authorize(action: string, cb: Authorize): this
            service(name: 'iam'): Authorizer
        }
    }
    interface CloudEvents {
        'Authorize.Allowed': {
            readonly action: string
            readonly user: Authentication
            readonly auth: Authorization
        }
        'Authorize.Denied': {
            readonly reason: Error
            readonly action: string
            readonly user: Authentication
            readonly auth: Authorization
        }
    }
}
interface Authentication {
    readonly id: string
}
interface Authorization {
    readonly tracecontext?: CloudEvent<string>
    /**
    items to be authorized
    */
    readonly items: readonly string[]
}
interface Authorizer {
    at(action: string, authorize: Authorize): this
    is(user: Authentication): Pick<Validator, 'can'>
}
interface Authorize {
    (user: Authentication, auth: Authorization): Promise<void>
}
interface Validator extends PromiseLike<void> {
    can(action: string): Pick<this, 'then' | 'for' | 'in'>
    for(i: string, ...a: readonly string[]): Pick<this, 'then' | 'in'>
    in(condition: Omit<Authorization, 'items'>): Pick<this, 'then'>
}