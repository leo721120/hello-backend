import IAM from '@io/lib/authorization'
import '@io/lib/error'
import '@io/lib/node'
//
Promise.try(async function () {
    const iam = IAM();

    iam.at('list:users', async function (user, auth) {
        user.id;
        auth.items;

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
    await iam.is({ id: 'uid-01' })
        .can('list:users')
        .for('uid-01', 'uid-02')
        ;
    await iam.is({ id: 'uid-01' })
        .can('list:users')
        .for('uid-03', 'uid-02')
        .then(null, console.error)
        ;
}).catch(console.error);