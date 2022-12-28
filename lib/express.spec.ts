import express from '@io/lib/express'
//
describe('express', function () {
    it('.use, asynchronize', async function () {
        const app = express();
        app.get('/abc', async function (req, res) {
            res.status(200).json({ pass: 1 });
        });
        const res = await app.fetch({
            url: '/abc',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({ pass: 1 });
    });
    it('.use, synchronize', async function () {
        const app = express();
        app.get('/abc', function (req, res) {
            res.status(200).json({ pass: 1 });
        });
        const res = await app.fetch({
            url: '/abc',
        });
        expect(res.status).toBe(200);
        expect(res.data).toEqual({ pass: 1 });
    });
});