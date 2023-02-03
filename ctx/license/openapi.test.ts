import express from '@io/lib/express'
//
describe('license/openapi', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await app.setup(await import('@io/app/mock'));
        await app.setup(await import('@io/ctx/license/openapi.mock'));
        const mock = await app.service('mock');
        mock.license.version(200, '成功');
    });
    describe('version', function () {
        it('success', async function () {
            const service = await app.service('license/openapi');
            const res = await service.version();
            expect(res).toEqual({
                version: '1.0.1',
                error_code: '0',
                error_message: '',
            });
        });
    });
});