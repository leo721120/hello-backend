import dataset from '@io/lib/dataset'
import shadows from '@io/lib/shadow'
import '@io/lib/node'
//
Promise.try(async function () {
    const up = shadows.up<Record<string, unknown>>({
        dataset: dataset(),

        async sync(id) {
            console.log('sync from device', id);
            return { from: 'sync' };
        },
        async load(id) {
            console.log('load from db', id);
            return { from: 'load' };
        },
        async save(id, data) {
            console.log('save to db', id, data);
        },
    });
    const shadow = up.shadow('/device/test-001');
    {
        const data = await shadow.get();
        console.info('get', { data });
    }
    await shadow.sync();
    {
        const data = await shadow.get();
        console.info('get', { data });
    }
    {
        await shadow.set('abc', 123);
        await shadow.del('xyz');
        await shadow.save();
    }
}).catch(console.error);