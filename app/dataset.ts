import express from '@io/app/express'
import '@io/lib/error'
import '@io/lib/node'
export interface DataSet {
    /**
    check if data provider exists
    */
    has<K extends string>(key: K): CallableFunction | undefined
    /**
    set data provider, called when data is not exists
    */
    set<K extends string>(key: K, finder: () => Promise<unknown>): this
    /**
    get cache, load from data provider if not exists
    */
    get<K extends string>(key: K): Promise<unknown> | undefined
    /**
    reset cache
    */
    del<K extends string>(key: K): this
    /**
    set time to live for a key

    NOTE: stop when expired, set again to restart
    */
    ttl<K extends string>(key: K, params: {
        /**
        time to live in milliseconds
        */
        readonly timeout: number
    }): this
}
export default express.service(function (app) {
    app.service<DataSet>('dataset', function () {
        const cache = new Map<string, Promise<unknown>>();
        const timer = new Map<string, NodeJS.Timeout>();
        const reset = new Map<string, () => void>();
        app.once('close', function () {
            for (const [, timeout] of timer) {
                clearTimeout(timeout);
            }
        });
        return {
            has(key: string) {
                return reset.get(key);
            },
            set(key: string, finder: () => unknown) {
                const cb = () => {
                    cache.set(key, Promise.defer(() => {
                        try {
                            app.emit('event', {
                                source: key,
                                type: 'DataSet.ItemFilling',
                                data: { key },
                            });
                            return finder();
                        } catch (e) {
                            // reset for next try
                            this.del(key);
                            throw e;
                        }
                    }));
                };
                {
                    reset.set(key, cb);
                    // reset to default
                    cb();
                }
                return this;
            },
            get(key: string) {
                return cache.get(key);
            },
            del(key: string) {
                // reset cache
                reset.get(key)?.();
                return this;
            },
            ttl(key, params) {
                const set = this;
                {
                    clearTimeout(timer.get(key));
                }
                timer.set(key, setTimeout(function () {
                    timer.delete(key);
                    set.del(key);
                    app.emit('event', {
                        source: key,
                        type: 'DataSet.ItemExpired',
                        data: { key },
                    });
                }, params.timeout));

                return this;
            },
        };
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'dataset'): DataSet
        }
    }
    interface CloudEvents {
        'DataSet.ItemFilling': {
            readonly key: string
        }
        'DataSet.ItemExpired': {
            readonly key: string
        }
    }
}