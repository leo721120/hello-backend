import dataset from '@io/lib/dataset'
import shadows from '@io/lib/shadow'
import '@io/lib/node'
//
Promise.try(async function () {
    const down = shadows.down<Record<string, unknown>>({
        dataset: dataset(),

        async sync(id, data) {
            console.log('sync to device', id, data);
        },
        async load(id) {
            console.log('load from db', id);
            return {};
        },
        async save(id, data) {
            console.log('save to db', id, data);
        },
    });
    const shadow = down.shadow('/device/test-001');
    {
        await shadow.set('abc', 123);
        await shadow.del('xyz');
        await shadow.save();
    }
    {
        await shadow.sync();
    }
}).catch(console.error);