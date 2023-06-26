import express from '@io/app/express'
//
describe('express', function () {
    it('.use, asynchronize', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.status(200).json({ pass: 1 });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.use, synchronize', async function () {
        const app = express().get('/abc', function (req, res) {
            res.status(200).json({ pass: 1 });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.use, promise', async function () {
        const app = express().get('/abc', function (req, res) {
            Promise
                .resolve()
                .then(function () {
                    res.status(200).json({ pass: 1 });
                });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.use, await promise', async function () {
        const app = express().get('/abc', async function (req, res) {
            await Promise
                .resolve()
                .then(function () {
                    res.status(200).json({ pass: 1 });
                });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.service', async function () {
        interface Service {
            foo(): boolean
        }
        const app = express();
        app.service<Service>('testonly', function () {
            return {
                foo() {
                    return true;
                },
            };
        });
        const service = app.service<Service>('testonly');
        expect(service.foo()).toBe(true);
    });
    it('.final, rfc7807', async function () {
        const app = express().use(function (req, res, next) {
            // force mixin express req/res prototypes
            next();
        });
        const res = await express
            .fetch(app)
            .get('/this/is/not/exist')
            ;
        //expect(res.headers['content-type']).toEqual('application/problem+json');
        expect(res.status).toBe(400);
        expect(res.body).toEqual(<rfc7807>{
            //type: expect.any(String),
            title: 'SyntaxError',
            detail: 'method not found',
            status: 400,
            instance: '/this/is/not/exist',
        });
    });
    it('.authenticate', async function () {
        const app = express();
        const ans = [] as unknown[];
        app.authenticate('basic', function (req) {
            ans.push(...req.authorization());
            return { id: 'u13' };
        });
        app.get('/test', async function (req, res) {
            const user = await req.authenticate();
            expect(user).toEqual({ id: 'u13' });
            res.status(200).end();
        });
        await express
            .fetch(app)
            .get('/test')
            .auth('a', 'b')
            ;
        expect(ans).toEqual([
            'basic',
            'a:b'.base64(),
        ]);
    });
    it.skip('.openapi', async function () {
        const document = JSON.schema('abc.yml',
            JSON.openapi(`${__dirname}/json.test.yml`)
        );
        const app = express().use(
            express.openapi(document)
        ).get('/foo/:id', async function (req, res) {
            const id = req.parameter('id');
            res.status(200).json({
                id,
            });
        });
        const res = await express
            .fetch(app)
            .get('/foo/199')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: '199',
        });
    });
    it.skip('.openapi, invalid request', async function () {
        const document = JSON.schema('abc.yml',
            JSON.openapi(`${__dirname}/json.test.yml`)
        );
        const app = express().use(
            express.openapi(document)
        ).get('/foo/:id', function (req, res) {
            const id = req.parameter('id');
            res.status(200).json({
                id,
            });
        });
        const url = `/foo/${'a'.repeat(9 + 1)}`;
        const res = await express
            .fetch(app)
            .get(url)
            ;
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            detail: 'must NOT have more than 9 characters',
            instance: url,
            status: 400,
            title: 'SyntaxError',
        });
    });
    it('.slowdown', async function () {
        const app = express().use(
            express.slowdown({
                time: 100,
                max: 3,
            })
        ).get('/foo', function (req, res) {
            res.status(200).json({
                good: true,
            });
        });
        await Promise.all(
            Array(3).fill(0).map(function () {
                return express
                    .fetch(app)
                    .get('/foo')
                    ;
            })
        );
        const res = await express
            .fetch(app)
            .get('/foo')
            .expect(429)
            .expect('ratelimit-remaining', '0')
            //.expect('ratelimit-reset', '1')
            .expect('ratelimit-limit', '3')
            .expect({
                title: 'SlowDown',
                status: 429,
                detail: 'too many requests',
                instance: '/foo'
            });
        expect(res.headers).toHaveProperty('ratelimit-reset', expect.any(String));
        expect(res.headers).toHaveProperty('retry-after', expect.any(String));
        expect(Number(res.headers['ratelimit-reset'])).toBeGreaterThan(1);
        expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
    });
});
describe('express/ws', function () {
    const app = express().ws('/testonly/ws', function (ws, req) {
        ws.on('message', function (byte) {
            const text = byte.toString();
            ws.send(JSON.stringify({
                echo: 123,
                text,
            }));
        });
    });
    beforeAll(function (done) {
        app.listen(done);
    });
    afterAll(function (done) {
        app.websocket().close(done);
    });
    it('.ws', async function () {
        const events = await import('node:events');
        const ws = app.websocket().connect('/testonly/ws');
        await events.default.once(ws, 'open');
        const done = events.default.once(ws, 'message');
        ws.send('abc123');
        const [text] = await done;
        expect(JSON.parse(text)).toEqual({
            echo: 123,
            text: 'abc123',
        });
    });
});
describe('express/res', function () {
    it('.servertiming', async function () {
        const app = express().get('/abc', function (req, res) {
            res.servertiming('db-05')
                .status(200)
                .json({ ok: true })
                ;
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.headers).toEqual(
            expect.objectContaining({
                'server-timing': expect.stringMatching(/^0;desc=db-05;dur=\d+$/),
            })
        );
    });
    it('.robotstag, noindex', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.robotstag('noindex')
                .status(200)
                .end();
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.headers).toEqual(
            expect.objectContaining({
                'x-robots-tag': 'noindex',
            })
        );
    });
    it('.elapse', async function () {
        const app = express().get('/abc', async function (req, res) {
            const elapse = res.elapse();
            res.status(200).json({ elapse });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.body).toEqual({
            elapse: expect.any(Number),
        });
    });
    it('.error', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.error(Error.build({
                message: 'only4test',
                name: '4test',
                status: 402,
            }));
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.headers['content-type']).toMatch('application/problem+json');
        expect(res.status).toBe(402);
        expect(res.body).toEqual(<rfc7807>{
            //type: expect.any(String),
            title: '4test',
            status: 402,
            detail: 'only4test',
            instance: '/abc',
        });
    });
    it('.range', async function () {
        const app = express().head('/abc', async function (req, res) {
            res.status(204).range({
                unit: 'items',
                size: 21,
            }).end();
        });
        const res = await express
            .fetch(app)
            .head('/abc')
            ;
        expect(res.headers).toEqual(expect.objectContaining({
            'content-range': 'items */21',
        }));
    });
});
describe('express/req', function () {
    it('.origin', async function () {
        const app = express().get('/abc', async function (req, res) {
            const e = req.origin();
            new URL(e);// can be parsed
            res.status(200).json({ e });
        });
        const res = await express
            .fetch(app)
            .get('/abc?q=124')
            ;
        expect(res.body.e).toMatch(RegExp('http(s)?://127.0.0.1:\\d+'));
    });
    it.skip('.router', async function () {
        const document = JSON.schema('abc.yml',
            JSON.openapi(`${__dirname}/json.test.yml`)
        );
        const app = express().use(
            express.openapi(document)
        ).get('/foo/:id', function (req, res) {
            const e = req.router();
            res.status(200).json({ e });
        });
        const res = await express
            .fetch(app)
            .get('/foo/123')
            ;
        expect(res.body.e).toBe('/foo/{id}');
    });
    it('.cloudevent', async function () {
        const app = express().get('/abc', async function (req, res) {
            const e = req.tracecontext();
            res.status(200).json({ e });
        });
        const res = await express
            .fetch(app)
            .get('/abc?q=124')
            ;
        expect(res.body.e).toEqual({
            specversion: '1.0',
            id: expect.any(String),
            source: '/abc?q=124',
            //time: expect.any(String),
            type: 'GET',
        });
    });
    it('.querystrings', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querystrings('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=123')
            ;
        expect(res.body.qs).toEqual([
            '123',
        ]);
    });
    it('.querystrings, multiple', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querystrings('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=123&qa=xyz')
            ;
        expect(res.body.qs).toEqual([
            '123',
            'xyz',
        ]);
    });
    it('.querystrings, comma separated', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querystrings('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=123,456&qa=xyz')
            ;
        expect(res.body.qs).toEqual([
            '123',
            '456',
            'xyz',
        ]);
    });
    it('.querystrings, empty if not found', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querystrings('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?pk=192')
            ;
        expect(res.body.qs).toEqual([
            // empty
        ]);
    });
    it('.querystring', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querystring('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=321')
            ;
        expect(res.body.qs).toEqual('321');
    });
    it('.querystring, omit if not found', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querystring('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?no=321')
            ;
        expect(res.body.qs).toEqual(undefined);
    });
    it('.querynumber', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querynumber('qa');
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=321')
            ;
        expect(res.body.qs).toEqual(321);
    });
    it('.querynumber, omit if NaN', async function () {
        const app = express().get('/abc', async function (req, res) {
            const qs = req.querynumber('qa');
            expect(qs).toBeUndefined();
            res.status(200).json({ qs });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=abg')
            ;
        expect(res.body.qs).toBeUndefined();
    });
});