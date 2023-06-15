import IAM from '@io/lib/authorization'
import '@io/lib/error'
//
describe('iam', function () {
    const iam = IAM();

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
    it('.allow', async function () {
        await iam
            .is({ id: 'uid-01' })
            .can('list:users')
            .for('uid-01', 'uid-02')
            ;
    });
    it('.deny', async function () {
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