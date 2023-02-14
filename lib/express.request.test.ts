import express from '@io/lib/express'
//
describe('express/req', function () {
    it('.cloudevent', async function () {
        const app = express().get('/abc', async function (req, res) {
            const e = req.cloudevent();
            res.status(200).json({ e });
        });
        const res = await express
            .fetch(app)
            .get('/abc?q=124')
            ;
        expect(res.body.e).toEqual({
            datacontenttype: 'application/json',
            //data: undefined,
            id: expect.any(String),
            source: '/abc?q=124',
            specversion: '1.0',
            time: expect.any(String),
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
});