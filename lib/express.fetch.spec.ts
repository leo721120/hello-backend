import express from '@io/lib/express.fetch'
//
describe('express/fetch', function () {
    it('.fetch', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.status(200).json({ abc: '123' });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ abc: '123' });
    });
});