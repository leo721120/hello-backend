import express from '@io/lib/express'
export default express.service(async function (app) {
    await app.setup(await import('@io/app/openapi'));
    await app.setup(await import('@io/app/config'));
    await app.setup(await import('@io/app/dapr'));
    await app.setup(await import('@io/app/db'));
    await app.setup(await import('@io/app/websocket'));
    await app.setup(await import('@io/app/version'));
    await app.setup(await import('@io/app/health'));
    await app.setup(await import('@io/app/event'));
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