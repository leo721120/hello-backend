import express from '@io/lib/express'
//
describe('manifest', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.query', async function () {
        const manifest = await app.service('manifest');
        expect(manifest).toEqual({
            version: '0.0.0',
        });
    });
});