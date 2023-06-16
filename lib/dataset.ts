import '@io/lib/node'
export interface DataSet {
    /**
    check if data provider exists
    */
    food<K extends keyof Set>(key: K): CallableFunction | undefined
    food<K extends string>(key: K): CallableFunction | undefined
    /**
    set data provider, called when data is not exists
    */
    feed<K extends keyof Set>(key: K, food: () => Promise<Set[K]>): this
    feed<K extends string>(key: K, food: () => Promise<unknown>): this
    /**
    get cache, load from data provider if not exists
    */
    find<K extends keyof Set>(key: K): Promise<Set[K]> | undefined
    find<K extends string>(key: K): Promise<unknown> | undefined
    /**
    reset cache
    */
    drop<K extends keyof Set>(key: K): this
    drop<K extends string>(key: K): this
}
export interface Set {
}
export default function (): DataSet {
    const cache = new Map<string, Promise<unknown>>();
    const reset = new Map<string, () => void>();

    return {
        food(key: string) {
            return reset.get(key);
        },
        feed(key: string, food: () => unknown) {
            const cb = () => {
                cache.set(key, Promise.defer(() => {
                    try {
                        return food();
                    } catch (e) {
                        // reset for next try
                        this.drop(key);
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
        find(key: string) {
            return cache.get(key);
        },
        drop(key: string) {
            // reset cache
            reset.get(key)?.();
            return this;
        },
    };
}