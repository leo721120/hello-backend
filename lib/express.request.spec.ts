import express from '@io/lib/express'
//
describe('express/req', function () {
    it('.tracecontext', async function () {
        const app = express();
        app.get('/abc', async function (req, res) {
            const text = req.tracecontext().traceparent();
            res.status(200).json({ text });
        });
        const res = await app.fetch<{ text: string }>({
            url: '/abc',
        });
        expect(res.data.text).toEqual(expect.any(String));
    });
    it('.querystrings', async function () {
        const app = express();
        app.get('/abc', async function (req, res) {
            const list = req.querystrings('qa');
            res.status(200).json({ list });
        });
        const res = await app.fetch<{ list: [] }>({
            url: '/abc?qa=123',
        });
        expect(res.data.list).toEqual([
            '123',
        ]);
    });
});