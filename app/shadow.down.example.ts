import express from '@io/app/express'
import '@io/lib/node'
//
Promise.try(async function () {
    const app = express();
    await app.setup(await import('@io/app/domain'));
    const shadows = app.service('shadows');
    const down = shadows.down<Record<string, unknown>>({
        dataset: app.service('dataset'),

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