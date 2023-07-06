import express from '@io/app/express'
import '@io/lib/node'
//
Promise.try(async function () {
    const app = express();
    await app.setup(await import('@io/app/domain'));
    const secret = app.secret('testonly');
    {
        await secret.del();
    }
    {
        const hit = await secret.has();
        console.log({ hit });
    }
    {
        await secret.set({
            hello: 'world',
        });
    }
    {
        const value = await secret.get();
        console.log({ value });
    }
    {
        const hit = await secret.has();
        console.log({ hit });
    }
    {
        //await secret.del();
    }
}).catch(console.error);