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
            const list = req.querystrings('qa');
            res.status(200).json({ list });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=123')
            ;
        expect(res.body.list).toEqual([
            '123',
        ]);
    });
});