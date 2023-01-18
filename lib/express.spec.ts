import express from '@io/lib/express.fetch'
//
describe('express', function () {
    it('.use, asynchronize', async function () {
        const app = express().get('/abc', async function (req, res) {
            res.status(200).json({ pass: 1 });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.use, synchronize', async function () {
        const app = express().get('/abc', function (req, res) {
            res.status(200).json({ pass: 1 });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.use, promise', async function () {
        const app = express().get('/abc', function (req, res) {
            Promise
                .resolve()
                .then(function () {
                    res.status(200).json({ pass: 1 });
                });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
    it('.use, await promise', async function () {
        const app = express().get('/abc', async function (req, res) {
            await Promise
                .resolve()
                .then(function () {
                    res.status(200).json({ pass: 1 });
                });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ pass: 1 });
    });
});