import express from '@io/lib/express'
//
describe('express/app', function () {
    it('.service', async function () {
        interface Service {
            go(): boolean
        }
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
        interface Service {
            good(): boolean
        }
        const app = express();
        let count = 0;
        app.service<Service>('testonly', function () {
            if (++count < 3) {
                throw Error('testfail');
            }
            return {
                good() {
                    return true;
                },
            };
        });
        await expect(app.service('testonly')).rejects.toThrow('testfail');
        await expect(app.service('testonly')).rejects.toThrow('testfail');
        const service = await app.service<Service>('testonly');
        expect(service.good()).toBe(true);
        expect(count).toBe(3);
    });
    it('.fetch', async function () {
        const app = express();
        app.get('/abc', async function (req, res) {
            res.status(200).json({ abc: '123' });
        });
        const res = await app.fetch({
            url: '/abc',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({ abc: '123' });
    });
    it('.final, rfc7807', async function () {
        const app = express().once('error', function() {
        });
        const res = await app.fetch({
            url: '/not-exist',
        });
        //expect(res.headers['content-type']).toEqual('application/problem+json');
        expect(res.data).toEqual({
            code: 'BadRequest',
            //type: 'none',// no used for now
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
        await app.fetch({
            url: '/test',
            auth: {
                username: 'a',
                password: 'b',
            },
        });
        expect(ans).toEqual([
            'basic',
            'a:b'.base64enc(),
        ]);
    });
});