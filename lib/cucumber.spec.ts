import cucumber from '@io/lib/cucumber'
import e from '@io/lib/express'
import autocannon from 'autocannon'
export default cucumber.define(function (environment, { step }) {
    interface Header {
        readonly name: string
        readonly value: string
    }
    step(/^new environment$/, async function () {
        const app = e().on('error', function (e) {
            if (process.env.DEBUG) {
                console.error(e);
            }
        });
        {
            await app.setup(await import('@io/app/domain'));
            await app.setup(await import('@io/app/mock'));
        }
        Object.assign(environment, <typeof environment>{
            benchmark: undefined,
            res: undefined,
            req: {},
            app,
        });
    });
    step(/^setup \/echo$/, function () {
        const app = environment.app;
        app.all('/echo', app.express.json(), function (req, res) {
            res.header(req.headers);
            res.status(200);
            res.json(req.body);
        });
    });
    step(/^url (.+)$/, function (url: string) {
        Object.assign(environment.req, <typeof environment.req>{
            url,
        });
    });
    step(/^headers$/, function (list: readonly Header[]) {
        Object.assign(environment.req, <typeof environment.req>{
            headers: list.reduce(function (obj, item) {
                return {
                    ...obj,
                    [item.name]: item.value,
                };
            }, {}),
        });
    });
    step(/^json$/, function (text: string) {
        Object.assign(environment.req, <typeof environment.req>{
            data: JSON.parse(text),
        });
    });
    step(/^method (\w+)$/, function (method: string) {
        const req = environment.req;
        const url = req.url ?? '/';
        const app = e.fetch(environment.app);
        const res = app[method.toLowerCase() as 'get'](url);
        {
            if (req.data) {
                res.send(req.data);
            }
            if (req.headers) {
                res.set(req.headers);
            }
        }
        Object.assign(environment, <typeof environment>{
            res,
        });
    });
    step(/^expect status should be (\d+)$/, async function (status: string) {
        await environment.res?.expect(+status);
    });
    step(/^expect headers should contain$/, async function (list: readonly Header[]) {
        await list.reduce(function (res, item) {
            return res?.expect(item.name, RegExp(item.value));
        }, environment.res);
    });
    step(/^expect body should be json$/, async function (text: string) {
        const res = await environment.res?.expect('Content-Type', /json/);
        expect(res?.body).toEqual(JSON.parse(text));
    });
    step(/^benchmark (\w+)$/, async function (method: string) {
        const namepipe = `//?/pipe/${process.cwd()}/.pipe`;
        const srv = environment.app.listen(namepipe);
        const req = environment.req;
        const url = req.url ?? '/';
        const event = await import('node:events');
        await event.default.once(srv, 'listening');// wait until server ready
        {
            await autocannon({
                method: method.toUpperCase() as 'GET',
                title: `${method} ${url}`,
                socketPath: namepipe,
                url,
                duration: 5,
            }).then(function (benchmark) {
                Object.assign(environment, {
                    benchmark,
                });
            }).catch(function (e) {
                environment.app.emit('error', e);
            });
        }
        await event.default.once(srv.close(), 'close');// wait until server down
    });
    step(/^print benchmark$/, async function () {
        console.info({
            ...environment.benchmark,
        });
    });
    step(/^expect timeouts should be less than (\d+)$/, async function (count: string) {
        expect(environment.benchmark?.timeouts).toBeLessThan(+count);
    });
    step(/^expect latency.mean should be less than (\d+)ms$/, async function (ms: string) {
        expect(environment.benchmark?.latency.mean).toBeLessThan(+ms);
    });
});
declare module '@io/lib/cucumber' {
    interface Fixture {
        readonly app: ReturnType<typeof e>
        readonly req: import('axios').AxiosRequestConfig
        readonly res?: import('supertest').Test
        readonly benchmark?: autocannon.Result
    }
}
if (!require.main) {
    cucumber.launch(`${__dirname}/cucumber.spec.feature`);
}