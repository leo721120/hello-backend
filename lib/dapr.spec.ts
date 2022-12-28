import dapr from '@io/lib/dapr'
//
describe('dapr', function () {
    const fetch = dapr();
    const mock = dapr.mock(fetch);
    {
        mock.invoke('testonly').get('/testcase').reply(200, {
            get: ['abc']
        });
        mock.publish('testonly').post('/testcase').reply(200, {
            status: 'pass',
        });
        mock.bindings.fetch('testonly').get('/testcase').reply(200, {
            pass: true,
        });
        mock.metadata().reply(200, {
            id: 'test',
        });
        mock.secret('testonly').get('test-key').reply(200, {
            key: 'pass',
        });
    }
    it('.invoke', async function () {
        const res = await fetch.invoke({
            appid: 'testonly',
            url: '/testcase',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            get: ['abc']
        });
    });
    it('.publish', async function () {
        const res = await fetch.publish({
            pubsubname: 'testonly',
            topic: 'testcase',
            id: 'AAAAAAAAAAAAAAAAAAAAA',
            specversion: '1.0',
            source: '/test/case',
            type: 'TEST.CASE',
            time: new Date().toISOString(),
            data: { abc: '123' },
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            status: 'pass',
        });
    });
    it('.binding', async function () {
        const res = await fetch.bindings.fetch({
            binding: 'testonly',
            url: '/testcase',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            pass: true
        });
    });
    it('.metadata', async function () {
        const res = await fetch.metadata();
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            id: 'test',
        });
    });
    it('.secret', async function () {
        const res = await fetch.secret({
            secretstore: 'testonly',
            key: 'test-key',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            key: 'pass',
        });
    });
});