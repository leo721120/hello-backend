import express from '@io/lib/express'
export default express.service(function (app) {
    const TOKEN_EXPIRE = process.env.TOKEN_EXPIRE?.numberify().narrow(1, 3600)
        || 5 * 60// default 5 minutes
        ;
    app.delete('/token', async function (req, res) {
        const user = await req.authenticate();
        {
            user;
        }
        res.status(204).end();
    }).get('/token', async function (req, res) {
        const expire = req.querynumber('expire') || TOKEN_EXPIRE;
        const user = await req.authenticate();
        {
            user;
        }
        const token = await req.jsonwebtoken(user, {
            expiresIn: expire * 1_000,// to milliseconds
        });
        res.status(200).json({// https://auth0.com/docs/api/authentication#authorization-code-flow44
            access_token: token,
            token_type: 'jwt',
            expires_in: expire,
        });
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            default expired time for token, in seconds
            
            @default 5 * 60
            */
            readonly TOKEN_EXPIRE?: string
        }
    }
}