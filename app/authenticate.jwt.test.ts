import express from '@io/lib/express'
//
describe('authenticate/jwt', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.service', async function () {
        const jwt = app.service('jwt');
        const token = await jwt.encode({
            a: 2,
            b: 'yy',
        });
        const info = await jwt.decode(token);
        expect(info).toEqual({
            a: 2,
            b: 'yy',
            exp: expect.any(Number),
            iat: expect.any(Number),
            iss: '@io/backend',
        });
    });
    it('.express', async function () {
        const mock = express.fetch(
            app.get('/testonly/jwt', async function (req, res) {
                res.json(await req.jsonwebtoken({
                    a: 2,
                    b: 'yy',
                }));
            }).get('/testonly/foo', async function (req, res) {
                const info = await req.authenticate();
                res.json(info);
            })
        );
        const res = await mock.get('/testonly/jwt').expect(200);
        ///expect(res.body as string).toBeInstanceOf(String);
        const ret = await mock.get('/testonly/foo')
            .set('authorization', `jwt ${res.body}`)
            .expect(200)
            ;
        expect(ret.body).toEqual({
            a: 2,
            b: 'yy',
            exp: expect.any(Number),
            iat: expect.any(Number),
            iss: '@io/backend',
        });
    });
});