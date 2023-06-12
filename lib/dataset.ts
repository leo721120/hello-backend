import '@io/lib/node'
export interface Set {
}
export default function (): DataSet {
    const cache = new Map<string, Promise<never>>();
    const reset = new Map<string, () => void>();

    return {
        feed(key: string, food: () => never) {
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
interface DataSet {
    feed<K extends keyof Set>(key: K, food: () => Promise<Set[K]>): this
    feed<K extends string>(key: K, food: () => Promise<unknown>): this
    find<K extends keyof Set>(key: K): Promise<Set[K]> | undefined
    find<K extends string>(key: K): Promise<unknown> | undefined
    drop<K extends keyof Set>(key: K): this
    drop<K extends string>(key: K): this
}