import express from '@io/lib/express'
import '@io/lib/error'
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
    it('.error', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.error(Error.$({
                message: 'only4test',
                name: '4test',
                status: 402,
            }));
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.body).toEqual({
            //type: expect.any(String),
            title: '4test',
            status: 402,
            detail: 'only4test',
            instance: '/abc',
        });
    });
    it('.range', async function () {
        const app = express().head('/abc', async function (req, res) {
            res.status(204).range({
                unit: 'items',
                size: 21,
            }).end();
        });
        const res = await express
            .fetch(app)
            .head('/abc')
            ;
        expect(res.headers).toEqual(expect.objectContaining({
            'content-range': 'items */21',
        }));
    });
});