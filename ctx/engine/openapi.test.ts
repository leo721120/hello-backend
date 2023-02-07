import express from '@io/lib/express'
//
describe('engine/openapi', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await app.setup(await import('@io/app/domain.mock'));
        await app.setup(await import('@io/ctx/engine/openapi.mock'));
    });
    beforeEach(async function () {
        const mock = await app.service('mock');
        mock.engine.addCamera(200, 'OperationSuccess');
        mock.engine.version(200, 'OperationSuccess');
    });
    describe('.version', function () {
        it('200, success', async function () {
            const service = await app.service('engine/openapi');
            const res = await service.version();
            expect(res).toEqual({
                rootPath: '/app/ai-engine/',
                product: { name: 'ai-engine', version: '1.0.1' },
                engine: { name: 'ai-engine', version: '1.0.1' },
            });
        });
    });
    describe('.addCamera', function () {
        it('200, success', async function () {
            const service = await app.service('engine/openapi');
            const res = await service.addCamera({
                name: 'new camera 1',
                url: 'rtsp://localhost:554/camera1',
                maxFaceCount: 5,
            });
            expect(res).toEqual({
                id: 'iVNuxqLGvSJX2y4g',
            });
        });
    });
});