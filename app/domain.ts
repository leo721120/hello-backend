import express from '@io/lib/express'
export default express.service(async function (app) {
    await app.setup(await import('@io/app/authenticate'));
    await app.setup(await import('@io/app/dataset'));
    await app.setup(await import('@io/app/openapi'));
    await app.setup(await import('@io/app/mongo'));
    await app.setup(await import('@io/app/dapr'));
    await app.setup(await import('@io/app/db'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/websocket'));
    await app.setup(await import('@io/app/webauthn'));
    await app.setup(await import('@io/app/version'));
    await app.setup(await import('@io/app/health'));
    await app.setup(await import('@io/app/event'));
    await app.setup(await import('@io/app/token'));
    await app.setup(await import('@io/app/time'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/apphub/openapi'));
    await app.setup(await import('@io/app/apphub/controller'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/inference/openapi'));
    await app.setup(await import('@io/app/inference/controller'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/tag/model'));
});