import express from '@io/lib/express.fetch'
//
describe('express/app', function () {
    interface Service {
        go(): boolean
    }
    it('.service', async function () {
        const app = express();
        app.service<Service>('testonly', function () {
            return {
                go() {
                    return true;
                },
            };
        });
        const service = await app.service<Service>('testonly');
        expect(service.go()).toBe(true);
    });
    it('.service, retryable', async function () {
        const app = express();
        let count = 0;
        app.service<Service>('testonly', function () {
            if (++count < 3) {
                throw Error('testfail');
            }
            return {
                go() {
                    return true;
                },
            };
        });
        await expect(app.service('testonly')).rejects.toThrow('testfail');
        await expect(app.service('testonly')).rejects.toThrow('testfail');
        const service = await app.service<Service>('testonly');
        expect(service.go()).toBe(true);
        expect(count).toBe(3);
    });
    it('.final, rfc7807', async function () {
        const app = express().use(function (req, res, next) {
            // force mixin express req/res prototypes
            next();
        }).once('error', function () {
        });
        const res = await express
            .fetch(app)
            .get('/not-exist')
            ;
        //expect(res.headers['content-type']).toEqual('application/problem+json');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            code: 'SyntaxError',
            //type: 'none',
            detail: 'method not found',
            instance: '/not-exist',
        });
    });
    it('.authenticate', async function () {
        const app = express();
        const ans = [] as unknown[];
        app.authenticate('basic', function (req) {
            ans.push(...req.authorization());
            return {};
        });
        app.get('/test', async function (req, res) {
            await req.authenticate();
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
});