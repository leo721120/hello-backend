import axios from '@io/lib/axios.mock'
//
describe('axios', function () {
    const fetch = axios();
    const mock = axios.mock(fetch);
    {
        mock.persist(true)
            .get('/testcase/abc').reply(200, {
                abc: 'test',
            });
    }
    it('.fetch', async function () {
        const res = await fetch.request({
            url: '/testcase/abc',
        });
        expect(res.mimetype()).toContain('json');
        expect(res.elapse()).toBeLessThan(100);
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            abc: 'test',
        });
    });
    it('.cloudevent', async function () {
        const res = await fetch.request({
            url: '/testcase/abc',
        });
        expect(res.cloudevent()).toEqual({
            datacontenttype: 'application/json',
            data: undefined,
            elapse: expect.any(Number),
            id: expect.any(String),
            source: '/testcase/abc',
            specversion: '1.0',
            status: 200,
            time: expect.any(String),
            type: 'GET',
        });
    });
});