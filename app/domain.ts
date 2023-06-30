import express from '@io/app/express'
export default express.service(async function (app) {
    await app.setup(await import('@io/app/openapi'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/authenticate'));
    await app.setup(await import('@io/app/authenticate.basic'));
    await app.setup(await import('@io/app/authenticate.token'));
    await app.setup(await import('@io/app/authenticate.fido2'));
    await app.setup(await import('@io/app/authenticate.jwt'));
    await app.setup(await import('@io/app/authorize'));
    await app.setup(await import('@io/app/version'));
    await app.setup(await import('@io/app/config'));
    await app.setup(await import('@io/app/health'));
    await app.setup(await import('@io/app/event'));
    await app.setup(await import('@io/app/dapr'));
    await app.setup(await import('@io/app/time'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/serversent'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/system/metric'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/notification/websocket'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/db/sequelize'));
    await app.setup(await import('@io/app/db/dataset'));
    await app.setup(await import('@io/app/db/shadow'));
    await app.setup(await import('@io/app/db/mongo'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/iam/webauthn'));
    await app.setup(await import('@io/app/iam/token'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/apphub/openapi'));
    await app.setup(await import('@io/app/apphub/controller'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/inference/openapi'));
    await app.setup(await import('@io/app/inference/controller'));
    // -----------------------------------------------
    await app.setup(await import('@io/app/tag/model'));
});
/*
/app/openapi
/app/config
/app/mongo
/app/dapr
/app/db

/app/authenticate/basic
/app/authenticate/fido2
/app/authenticate/jwt
/app/authenticate/otp

/app/iam/authenticate
/app/iam/permission
/app/iam/authorize
/app/iam/webauthn
/app/iam/token
/app/iam/audit
/app/iam/group
/app/iam/role
/app/iam/user

/app/system/version
/app/system/health
/app/system/metric
/app/system/event
/app/system/time
/app/system/log

/app/notification/serversent
/app/notification/websocket
/app/notification/webhook
/app/notification/email

/app/db/sequelize
/app/db/dataset
/app/db/shadow
/app/db/mongo
/app/db/lmdb
/app/db/sql
/app/db/pg
*/