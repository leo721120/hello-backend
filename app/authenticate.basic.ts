import express from '@io/app/express'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    interface Credential {
        readonly username: string
        readonly password: string
    }
    const schema = JSON.schema<Credential>('authenticate/basic', {
        additionalProperties: false,
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: {
                type: 'string',
                minLength: 1,
                maxLength: 99,
            },
            password: {
                type: 'string',
                minLength: 1,
                maxLength: 99,
            },
        },
    });
    app.authenticate('basic', async function (req) {
        const [, credentials] = req.authorization();
        const [username, password] = credentials
            .decode('base64')
            .split(':')
            ;
        schema.assert({ username, password }, {
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