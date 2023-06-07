import axios from '@io/lib/axios'
//
describe('axios', function () {
    const fetch = axios({
    });
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
        expect(res.tracecontext()).toEqual({
            specversion: '1.0',
            elapse: expect.any(Number),
            id: expect.any(String),
            source: '/testcase/abc',
            //time: expect.any(String),
            type: '200',
            data: undefined,
        });
    });
});
describe('axios/openapi', function () {
    const document = JSON.schema('abc.yml',
        JSON.openapi(`${__dirname}/json.test.yml`)
    );
    const fetch = axios.openapi(axios(), document);
    const mock = axios.mock(fetch.axios);

    it('200', async function () {
        {
            mock.get('/foo/123?q1=xyz').reply(200, {
                id: 'abc',
                a: '0123',
            });
        }
        const res = await fetch({
            openapi: '/foo/{id}',
            method: 'get',
            params: {
                id: 123,
            },
            query: {
                q1: 'xyz',
            },
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
            id: 'abc',
            a: '0123',
        });
    });
    it('502, malformed response', async function () {
        {
            mock.get('/foo/123?q1=xyz').reply(200, {
                bad: 'item',
            });
        }
        const err = await fetch({
            openapi: '/foo/{id}',
            method: 'get',
            params: {
                id: 123,
            },
            query: {
                q1: 'xyz',
            },
        }).catch(function (e: Error) {
            return e;
        });
        expect(err).toBeInstanceOf(Error);
        const e = err as Error;
        expect(e.status).toBe(502);
        expect(e.message).toBe('must NOT have additional properties');
        expect(e.name).toBe(SyntaxError.name);
    });
    it('ANY, servertiming', async function () {
        {
            mock.get('/foo/123?q1=xyz').reply(200, {
                id: 'abc',
                a: '0123',
            });
        }
        const ev = [];
        const ce = CloudEvent({
            specversion: '1.0',
            id: CloudEvent.id(),
            type: 'test.only',
            source: 'test.only',
            data: {},
        });
        ce.servertiming = function (a) {
            ev.push(a);
        };
        const res = await fetch({
            tracecontext: ce,
            openapi: '/foo/{id}',
            method: 'get',
            params: {
                id: 123,
            },
            query: {
                q1: 'xyz',
            },
        });
        expect(res.status).toBe(200);
        expect(ev.length).toBe(1);
    });
});