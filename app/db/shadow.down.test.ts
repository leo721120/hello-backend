import express from '@io/app/express'
//
describe('shadow/down', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.', async function () {
        const shadows = app.service('shadows');
        const down = shadows.down<Record<string, unknown>>({
            dataset: app.service('dataset'),

            async sync(id, data) {
            },
            async load(id) {
                return {};
            },
            async save(id, data) {
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
    });
});