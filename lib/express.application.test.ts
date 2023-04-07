import express from '@io/lib/express'
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
        const service = app.service<Service>('testonly');
        expect(service.go()).toBe(true);
    });
    it('.final, rfc7807', async function () {
        const app = express().once('error', function () {
            //
        }).use(function (req, res, next) {
            // force mixin express req/res prototypes
            next();
        });
        const res = await express
            .fetch(app)
            .get('/api/to/not-exist')
            ;
        //expect(res.headers['content-type']).toEqual('application/problem+json');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            //type: expect.any(String),
            title: 'SyntaxError',
            detail: 'method not found',
            status: 400,
            instance: '/api/to/not-exist',
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