import type { DataSet } from '@io/app/db/dataset'
import type { Shadow } from '@io/app/db/shadow'
export default function <V extends object>(options: {
    readonly dataset: DataSet
    /**
    called when shadow.sync() is called
    */
    sync<A extends V>(id: string, data: Readonly<A>): Promise<void>
    /**
    called when shadow.load() is called
    */
    load(id: string): Promise<Readonly<V>>
    /**
    called when shadow.save() is called
    */
    save<A extends V>(id: string, data: Readonly<A>): Promise<void>
}) {
    return {
        shadow(id: `/${string}`): Shadow<V> {
            const key = `/shadow/down${id}`;

            return {
                async sync() {
                    const data = await this.get();
                    await options.sync(id, data);
                },
                async save() {
                    const data = await this.get();
                    return options.save(id, data);
                },
                async load() {
                    options.dataset.del(key);
                    options.dataset.set(key, async function () {
                        return options.load(id);
                    });
                },
                async get(field?: keyof V) {
                    if (!options.dataset.has(key)) {
                        // load from database should be more efficient and reliable
                        await this.load();
                    }

                    const data = await options.dataset.get(key) as Readonly<V> | undefined;
                    return field ? data?.[field] : data;
                },
                async set(field, value) {
                    const data = await this.get() as V;
                    data[field] = value;
                },
                async del(field) {
                    const data = await this.get() as V;
                    delete data[field];
                },
            };
        },
    };
}