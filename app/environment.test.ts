import express from '@io/lib/express'
//
describe('service', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('environment', async function () {
        const info = await app.service('environment');
        expect(info).toEqual({
            version: expect.any(String),
        });
    });
});