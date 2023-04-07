import axios from '@io/lib/axios'
//
describe('axios', function () {
    const fetch = axios();
    const mock = axios.mock(fetch);
    {
        mock.persist(true)
            .get('/testcase/err').replyWithError(Error('4test'))
            .get('/testcase/abc').reply(200, {
                abc: 'test',
            })
            ;
    }
    it('.request', async function () {
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
    it('.request, error', async function () {
        const err = await fetch.request({
            url: '/testcase/err',
        }).then(function () {
            return undefined;
        }).catch(function (e) {
            return e as Error;
        });
        expect(err).toEqual(Error('4test'));
        expect(Object.keys(err!).length).toBeLessThan(9);
    });
    it('.cloudevent', async function () {
        const res = await fetch.request({
            url: '/testcase/abc',
        });
        expect(res.cloudevent()).toEqual({
            elapse: expect.any(Number),
            id: expect.any(String),
            source: '/testcase/abc',
            time: expect.any(String),
            type: '200',
        });
    });
});