import express from '@io/lib/express.fetch'
//
describe('express/res', function () {
    it('.elapse', async function () {
        const app = express().get('/abc', async function (req, res) {
            const elapse = res.elapse();
            res.status(200).json({ elapse });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.body).toEqual({
            elapse: expect.any(Number),
        });
    });
});