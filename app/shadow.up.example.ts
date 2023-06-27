import express from '@io/app/express'
import '@io/lib/node'
//
Promise.try(async function () {
    const app = express();
    await app.setup(await import('@io/app/domain'));
    const shadows = app.service('shadows');
    const up = shadows.up<Record<string, unknown>>({
        dataset: app.service('dataset'),

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