import express from '@io/app/express'
import '@io/lib/error'
import '@io/lib/node'
//
Promise.try(async function () {
    const app = express();
    await app.setup(await import('@io/app/domain'));
    const iam = app.service('iam');
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
    {
        app.on('Authorize.Allowed', console.info);
        app.on('Authorize.Denied', console.info);
    }
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