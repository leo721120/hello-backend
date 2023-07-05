import express from '@io/app/express'
//
describe('GET /blobs', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('200', async function () {
        const res = await express.fetch(app)
            .get('/blobs?type=log')
            .expect(200)
            ;
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'log',
                }),
            ]),
        );
    });
});
describe('GET /blobs/:type/:name', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('404', async function () {
        const res = await express.fetch(app)
            .get('/blobs/log/not-found.log')
            .expect(404)
            ;
        expect(res.body).toEqual({
            detail: 'blob not found',
            instance: '/blobs/log/not-found.log',
            status: 404,
            title: Error.Code.NotFound,
        });
    });
});