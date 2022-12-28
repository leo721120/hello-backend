import express from '@io/lib/express'
//
describe('apphub/openapi', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await app.setup(await import('@io/app/mock'));
        await app.setup(await import('@io/ctx/apphub/openapi.mock'));
        const mock = await app.service('mock');
        mock.apphub.login(200);
    });
    describe('login', function () {
        it('success', async function () {
            const service = await app.service('apphub/openapi');
            const res = await service.login();
            expect(res).toEqual({
                status: 'CHANGED',
                token: 'token123',
            });
        });
    });
});