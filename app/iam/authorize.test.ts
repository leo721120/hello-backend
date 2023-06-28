import express from '@io/app/express'
import '@io/lib/error'
//
describe('service/iam', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        const iam = app.service('iam');
        iam.at('list:users', async function (user, auth) {
            if (auth.items.includes('uid-03')) {
                throw Error.build({
                    message: `cannot access`,
                    name: 'NotAllowed',
                    params: {
                        items: auth.items,
                    },
                });
            }
        });
    });
    it('.allow', async function () {
        const iam = app.service('iam');
        await iam
            .is({ id: 'uid-01' })
            .can('list:users')
            .for('uid-01', 'uid-02')
            ;
    });
    it('.deny', async function () {
        const iam = app.service('iam');
        const e = await iam
            .is({ id: 'uid-01' })
            .can('list:users')
            .for('uid-01', 'uid-03')
            .then(null, e => e as Error)
            ;
        expect(e).toBeInstanceOf(Error);
        expect(e?.name).toBe('NotAllowed');
    });
});