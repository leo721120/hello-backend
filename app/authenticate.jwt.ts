import jsonwebtoken from 'jsonwebtoken'
import express from '@io/lib/express'
import crypto from 'node:crypto'
import '@io/lib/event'
import '@io/lib/error'
import '@io/lib/node'
import manifest from '@io/lib/manifest'
export default express.service(async function (app) {
    const JWT_ISSUER = process.env.JWT_ISSUER
        ?? manifest.name
        ;
    const { JWT_SECRET, JWT_PUBLIC } = await Promise.try(function () {
        if (!process.env.JWT_SECRET) {
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
            });
            const JWT_SECRET = privateKey
                .export({ type: 'pkcs1', format: 'pem' })
                .toString()
                ;
            const JWT_PUBLIC = publicKey
                .export({ type: 'pkcs1', format: 'pem' })
                .toString()
                ;
            app.emit('event', CloudEvent({
                source: '/authenticate',
                type: 'auto.generate.jwt.keys',
                id: null,
            }));
            return {
                JWT_SECRET,
                JWT_PUBLIC,
            };
        } else if (!process.env.JWT_PUBLIC) {
            const JWT_SECRET = process.env.JWT_SECRET.decode('base64');
            const JWT_PUBLIC = crypto
                .createPublicKey(JWT_SECRET)
                .export({ type: 'pkcs1', format: 'pem' })
                .toString()
                ;
            app.emit('event', CloudEvent({
                source: '/authenticate',
                type: 'auto.generate.jwt.key.public',
                id: null,
            }));
            return {
                JWT_SECRET,
                JWT_PUBLIC,
            };
        } else {
            return {
                JWT_SECRET: process.env.JWT_SECRET.decode('base64'),
                JWT_PUBLIC: process.env.JWT_PUBLIC.decode('base64'),
            };
        }
    });
    app.authenticate('jwt', async function (req) {
        try {
            const [, token] = req.authorization();

            return jsonwebtoken.verify(token, JWT_PUBLIC, {
                algorithms: ['RS256'],
            });
        } catch (e) {
            if (e instanceof jsonwebtoken.TokenExpiredError) {
                throw Error.$({
                    message: e.message,
                    name: 'TokenExpired',
                    status: 401,
                    reason: e,
                });
            }
            if (e instanceof Error) {
                throw Error.$({
                    message: e.message,
                    name: 'InvalidToken',
                    status: 401,
                    reason: e,
                });
            }
            throw Error.$({
                message: 'fail to verify token',
                name: 'UnexpectedError',
                status: 500,
                reason: e,
            });
        }
    }).use(function (req, res, next) {
        Object.assign(req, <typeof req>{
            async jsonwebtoken(info, options?) {
                return jsonwebtoken.sign(info, JWT_SECRET, {
                    algorithm: 'RS256',
                    issuer: JWT_ISSUER,
                    expiresIn: '1h',
                    ...options,
                });
            },
        });
        return next();
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            private key in PKCS1 PEM base64 format
            */
            readonly JWT_SECRET?: string
            /**
            public key in PKCS1 PEM base64 format
            */
            readonly JWT_PUBLIC?: string
            /**
            @default manifest.name
            */
            readonly JWT_ISSUER?: string
        }
    }
    namespace Express {
        interface Request {
            /**
            sign a jsonwebtoken
            */
            jsonwebtoken<A extends object>(info: A, options?: jsonwebtoken.SignOptions): Promise<string>
        }
    }
}