import express from '@io/app/express'
export default express.service(async function (app) {
    await app.setup(await import('@io/app/authenticate.basic'));
    await app.setup(await import('@io/app/authenticate.fido2'));
    await app.setup(await import('@io/app/authenticate.jwt'));
});