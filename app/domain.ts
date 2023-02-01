import express from '@io/lib/express'
export default express.service(async function (app) {
    await app.setup(await import('@io/app/manifest'));
    await app.setup(await import('@io/app/openapi'));
    await app.setup(await import('@io/app/mongo'));
    await app.setup(await import('@io/app/dapr'));
    await app.setup(await import('@io/app/db'));
    await app.setup(await import('@io/app/websocket'));
    await app.setup(await import('@io/app/version'));
    await app.setup(await import('@io/app/health'));
    await app.setup(await import('@io/app/event'));
    await app.setup(await import('@io/ctx/engine/openapi'));
    await app.setup(await import('@io/ctx/apphub/openapi'));
    await app.setup(await import('@io/ctx/license/openapi'));
    await app.setup(await import('@io/ctx/user/controller'));
    await app.setup(await import('@io/ctx/tag/service'));
    await app.setup(await import('@io/ctx/tag/controller'));
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            filter level
            */
            readonly LOG_LEVEL?:
            | 'silent'
            | 'info'
        }
    }
}