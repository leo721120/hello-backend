import express from '@io/app/express'
//
describe('POST /sse', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('201', async function () {
        const res = await express.fetch(app)
            .post('/sse')
            .auth('test', 'only')
            .expect(201)
            ;
        expect(res.body).toEqual({
            id: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
        });
    });
});