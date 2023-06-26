import express from '@io/app/express'
//
describe('engine/openapi', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await app.setup(await import('@io/app/domain.mock'));
        await app.setup(await import('@io/app/openapi.mock'));
    });
    beforeAll(async function () {
        const mock = await app
            .service('mock')
            .openapi(`${__dirname}/./openapi.yml`)
            ;
        Object.assign(process.env, <typeof process.env>{
            APPHUB_URL: mock.addr(),
        });
    });
    afterAll(function () {
        app.emit('close');
    });
    describe('.login', function () {
        it('200, success', async function () {
            const res = await app
                .service('apphub/openapi')
                .invoke({})
                .login()
                ;
            expect(res).toEqual({
                status: 'CHANGED',
                token: expect.any(String),
            });
        });
    });
});