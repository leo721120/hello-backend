import express from '@io/app/express'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    const schema = JSON.schema<string[]>('authenticate/basic', {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: {
            type: 'string',
            minLength: 1,
            maxLength: 999,
        },
    });
    app.authenticate('basic', function (req) {
        const [, credentials] = req.authorization();
        const [username, password] = credentials
            .decode('base64')
            .split(':')
            ;
        schema.assert([username, password], {
            message: 'invalid credentials for basic authentication',
        });
        {
            password;
        }
        return {
            id: username,
        };
    });
});