import express from '@io/lib/express'
//
describe('config', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.manifest', async function () {
        expect(process.manifest).toEqual(
            expect.objectContaining({
                version: '0.0.0',
                name: '@io/backend',
            })
        );
    });
});