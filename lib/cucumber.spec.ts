import cucumber from '@io/lib/cucumber'
import e from '@io/lib/express.fetch'
export type Test = ReturnType<ReturnType<typeof e.fetch>['get']>
export interface World {
    readonly res?: Test
    readonly req: Array<(req: Test) => void>
    readonly app: ReturnType<typeof e>
    readonly url: string
}
export default cucumber.steps(function ({ step }) {
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
        cucumber.world<World>({
            res: undefined,
            url: '/',
            req: [],
            app,
        });
    });
    step(/^setup \/echo$/, function () {
        const { app } = cucumber.world<World>();
        app.all('/echo', app.express.json(), function (req, res) {
            res.header(req.headers);
            res.status(200);
            res.json(req.body);
        });
    });
    step(/^login$/, async function (list: readonly Dict<string>[]) {
        const { req } = cucumber.world<World>();
        req.push(function (req) {
            for (const auth of list) {
                req.auth(auth.username, auth.password);
            }
        });
    });
    step(/^url (.+)$/, function (url: string) {
        const w = cucumber.world<World>();
        Object.assign(w, { url });
    });
    step(/^headers$/, function (list: readonly Header[]) {
        const { req } = cucumber.world<World>();
        req.push(function (req) {
            for (const item of list) {
                req.set(item.name, item.value);
            }
        });
    });
    step(/^json$/, function (text: string) {
        const { req } = cucumber.world<World>();
        req.push(function (req) {
            switch (req.method.toLowerCase()) {
                case 'get':
                case 'head':
                    return console.assert(`cannot send body with ${req.method}`);
                default:
                    return req.send(JSON.parse(text));
            }
        });
    });
    step(/^method (\w+)$/, function (method: string) {
        const w = cucumber.world<World>();
        const app = e.fetch(w.app);
        const res = app[method.toLowerCase() as 'get'](w.url);
        for (const req of w.req) {
            req(res);
        }
        Object.assign(w, {
            res,
        });
    });
    step(/^expect status should be (\d+)$/, async function (status: string) {
        const w = cucumber.world<World>();
        await w.res?.expect(+status);
    });
    step(/^expect headers should contain$/, async function (list: readonly Header[]) {
        const w = cucumber.world<World>();
        for (const item of list) {
            w.res?.expect(item.name, RegExp(item.value));
        }
        await w.res;
    });
    step(/^expect body should be json$/, async function (text: string) {
        const w = cucumber.world<World>();
        const res = await w.res?.expect('Content-Type', /json/);
        expect(res?.body).toEqual(JSON.parse(text));
    });
});
if (!require.main) cucumber.launch(`${__dirname}/cucumber.spec.feature`, [
    exports.default,
]);