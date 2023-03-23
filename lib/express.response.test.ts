import express from '@io/lib/express'
//
describe('express/res', function () {
    it('.robotstag, noindex', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.robotstag('noindex')
                .status(200)
                .end();
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.headers).toEqual(
            expect.objectContaining({
                'x-robots-tag': 'noindex',
            })
        );
    });
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