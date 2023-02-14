import environment from '@io/lib/cucumber'
import e from '@io/lib/express'
import '@io/lib/node'
//import autocannon from 'autocannon'
export default environment.define(function ({ step }) {
    interface Header {
        readonly name: string
        readonly value: string
    }
    step(/^new environment$/, async function () {
        const events = await import('node:events');
        const watch = new events.EventEmitter();
        const app = e().on('event', function (...a) {
            // forward events to watch
            watch.emit('event', ...a);
        }).on('error', function (e) {
            if (process.env.DEBUG) {
                console.error(e);
            }
        });
        {
            await app.setup(await import('@io/app/domain'));
            await app.setup(await import('@io/app/domain.mock'));
        }
        Object.assign(environment, <typeof environment>{
            e: events.default.on(watch, 'event'),
            //benchmark: undefined,
            res: undefined,
            req: {},
            app,
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
    step(/^expect events should be$/, async function (list: readonly CloudEvent<string>[]) {
        for (const e of list) {
            const res = await environment.e?.next();
            expect(res?.value).toEqual([expect.objectContaining(e)]);
        }
    });
    /*step(/^benchmark (\w+)$/, async function (method: string) {
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
    });*/
});
declare module '@io/lib/cucumber' {
    interface Fixture {
        readonly e?: AsyncIterableIterator<object>
        readonly app: ReturnType<typeof e>
        readonly req: import('axios').AxiosRequestConfig
        readonly res?: import('supertest').Test
        //readonly benchmark?: autocannon.Result
    }
}
if (!require.main) {
    environment.launch(`${__dirname}/domain.feature`);
}