import dataset from '@io/lib/dataset'
import express from '@io/lib/express'
import '@io/lib/error'
import '@io/lib/node'
export default express.service(function (app) {
    app.service<DataSet>('dataset', function () {
        const ttl = new Map<string, NodeJS.Timeout>();
        const set = dataset();
        app.once('close', function () {
            for (const [, timeout] of ttl) {
                clearTimeout(timeout);
            }
        });
        return Object.assign(set, <DataSet>{
            ttl(key, params) {
                {
                    clearTimeout(ttl.get(key));
                }
                ttl.set(key, setTimeout(function () {
                    set.drop(key);
                    app.emit('event', {
                        source: key,
                        type: 'DataSet.ItemExpired',
                        data: { key },
                    });
                }, params.timeout));
            },
        });
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'dataset'): DataSet
        }
    }
    interface CloudEvents {
        'DataSet.ItemExpired': {
            readonly key: string
        }
    }
}
interface DataSet extends ReturnType<typeof dataset> {
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