import environment from '@io/app/domain.test'
import express from '@io/app/express'
export default environment.define(function () {
});
if (!require.main) {
    describe('GET /metrics', function () {
        const app = express();

        beforeAll(async function () {
            await app.setup(await import('@io/app/domain'));
        });
        it('200', async function () {
            const res = await express.fetch(app)
                .get('/metrics')
                .expect(200)
                ;
            expect(res.body).toEqual(
                expect.objectContaining({
                    app_rss: expect.any(Number),
                    app_totalheap: expect.any(Number),
                    app_usedheap: expect.any(Number),
                    sys_freemem: expect.any(Number),
                    sys_totalmem: expect.any(Number),
                })
            );
        });
    });
}