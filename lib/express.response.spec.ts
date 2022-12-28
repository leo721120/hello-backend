import express from '@io/lib/express'
//
describe('express/res', function () {
    it('.elapse', async function () {
        const app = express();
        app.get('/abc', async function (req, res) {
            const elapse = res.elapse();
            res.status(200).json({ elapse });
        });
        const res = await app.fetch({
            url: '/abc',
        });
        expect(res.data).toEqual({
            elapse: expect.any(Number),
        });
    });
});