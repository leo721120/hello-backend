import express from '@io/lib/express'
//
describe('dapr', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await app.setup(await import('@io/app/mock'));
        const mock = await app.service('mock');
        {
            mock.invoke('testonly').get('/testonly').reply(200, [
                'pass',
            ]);
            mock.publish('testonly').post('/testonly').reply(200, {
                status: 'pass',
            });
            mock.bindings.fetch('testonly').get('/testonly').reply(200, [
                'pass',
            ]);
        }
    });
    it('.invoke', async function () {
        const dapr = await app.service('dapr');
        const res = await dapr.invoke({
            appid: 'testonly',
            url: '/testonly',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual([
            'pass',
        ]);
    });
});