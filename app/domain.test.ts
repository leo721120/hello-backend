import environment from '@io/lib/cucumber'
import express from '@io/lib/express'
import '@io/lib/node'
import '@io/lib/json'
//import autocannon from 'autocannon'
export default environment.define(function ({ step }) {
    afterEach(function () {
        environment.app.emit('close');// stop mock services
    });
    interface Header {
        readonly name: string
        readonly value: string
    }
    step(/^new environment$/, async function (list?: readonly Record<'service', string>[]) {
        const events = await import('node:events');
        const watch = new events.EventEmitter();
        const app = express().on('event', function (...a) {
            if (process.env.DEBUG) {
                console.info(...a);
            }
            {// cannot use `app` directly because of `event.on` throw error if got `error` event
                watch.emit('event', ...a);
            }
        }).on('error', function (e) {
            if (process.env.DEBUG) {
                console.error(e);
            }
            environment.errors.push(e);
        });
        {
            await app.setup(await import('@io/app/domain'));
            await app.setup(await import('@io/app/domain.mock'));
            await app.setup(await import('@io/app/openapi.mock'));
        }
        for (const item of list ?? []) {
            item;
        }
        Object.assign(environment, <typeof environment>{
            events: events.default.on(watch, 'event'),
            errors: [] as Error[],
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
    step(/^headers$/, function (list: readonly Record<'name' | 'value', string>[]) {
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
        const app = express.fetch(environment.app);
        const req = environment.req;
        const url = req.url ?? '/';
        const res = app[method.toLowerCase() as 'get'](url);
        {
            if (req.headers) {
                res.set(req.headers);
            }
            if (req.data) {
                res.send(req.data);
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
    step(/^expect body schema should be$/, async function (list: readonly Record<'openapi', string>[]) {
        const openapi = JSON.schema('openapi.json');
        const res = await environment.res;
        const sep = list.map(function (item) {
            return JSON.pointer.escape(item.openapi);
        });
        try {
            openapi.node(...sep).assert(res?.body);
        } catch (e) {
            // more information for debug
            console.error(e);
            throw e;
        }
    });
    step(/^expect body should match json$/, async function (text: string) {
        const res = await environment.res?.expect('Content-Type', /json/);
        const ans = JSON.parse(text) as unknown;

        if (Array.isArray(ans)) {
            expect(res?.body).toEqual(
                expect.arrayContaining(
                    ans.map(expect.objectContaining)
                )
            );
        } else {
            expect(res?.body).toEqual(
                expect.objectContaining(
                    ans
                )
            );
        }
    });
    step(/^expect body should be json$/, async function (text: string) {
        const res = await environment.res?.expect('Content-Type', /json/);
        expect(res?.body).toEqual(JSON.parse(text));
    });
    step(/^expect events should be$/, async function (list: readonly CloudEvent<string>[]) {
        for (const e of list) {
            const res = await environment.events.next();
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
        readonly events: AsyncIterableIterator<object>
        readonly errors: Error[]
        readonly app: Application
        readonly req: import('axios').AxiosRequestConfig
        readonly res?: import('supertest').Test
        //readonly benchmark?: autocannon.Result
    }
}
if (!require.main) {
    environment.launch(`${__dirname}/domain.feature`);
}