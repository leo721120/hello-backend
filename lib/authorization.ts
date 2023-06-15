import '@io/lib/error'
import '@io/lib/node'
export interface Authorizations {
    /**
    use declare to append types

    @example
    declare module '@io/lib/authorization' {
        interface Authorizations {
            readonly 'list:users': User['id']
        }
    }
    */
}
export default function () {
    const iam = new Map<Action<string>, Handler<string>>();

    return {
        is(user: Authentication): Authorization {
            const map = Object.assign(new Map<Action<string>, Information<string>>(), {
                got(key: string) {
                    const v = map.get(key);
                    console.assert(v);
                    return v!;
                },
            });
            return {
                can(action) {
                    map.set(action, {
                        condition: {},
                        items: [],
                    });
                    return {
                        for(...items) {
                            const info = map.got(action);
                            Object.assign(info, <Partial<typeof info>>{
                                items,
                            });
                            return this;
                        },
                        in(condition) {
                            const info = map.got(action);
                            Object.assign(info, <Partial<typeof info>>{
                                condition,
                            });
                            return this;
                        },
                        then(done?, fail?) {
                            return Promise.try(async function () {
                                const list = [...map.entries()];

                                for await (const [action, info] of list) {
                                    const cb = iam.get(action) ?? function () {
                                        throw Error.build({
                                            message: `${action} not allowed`,
                                            name: 'NotAllowed',
                                            status: 403,
                                            params: { action },
                                            reason: 'there is no authorize handler, default is deny',
                                        });
                                    };
                                    await cb(user, info);
                                }
                            }).then(done, fail);
                        },
                    };
                },
            };
        },
        at<K extends string>(action: K, handler: Handler<K>) {
            iam.set(action, handler);
            return this;
        },
    };
}
interface Authentication {
    /**
    identity to determine if the user can perform the action
    */
    readonly id: string
}
interface Authorization {
    can<K extends string>(action: K): Validator<K>
}
interface Information<K extends string> {
    readonly items: ReadonlyArray<Action<K>>
    readonly condition: object
}
interface Validator<K extends string> extends PromiseLike<void> {
    for<A extends Action<K>>(...a: readonly A[]): this
    in(condition: Information<K>['condition']): this
}
interface Handler<K extends string> {
    /**
    used to determine if the user can perform the action in the given context
    */
    (user: Authentication, auth: Information<K>): Promise<void>
}
type Action<K extends string> = K extends keyof Authorizations
    ? Authorizations[K]
    : string
    ;