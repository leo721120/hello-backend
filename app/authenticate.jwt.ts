import type { KeyObject } from 'node:crypto'
import jsonwebtoken from 'jsonwebtoken'
import manifest from '@io/lib/manifest'
import express from '@io/app/express'
import crypto from 'node:crypto'
import '@io/lib/event'
import '@io/lib/error'
import '@io/lib/node'
export default express.service(function (app) {
    app.authenticate('jwt', async function (req) {
        const [, token] = req.authorization();
        const jwt = app.service('jwt');
        return jwt.decode<never>(token);
    }).service<Crypto>('jwt', function () {
        return {
            async secret() {
                const key = await Promise.try(function () {
                    const { privateKey } = crypto.generateKeyPairSync('rsa', {
                        modulusLength: 2048,
                    });
                    app.emit('event', {
                        source: '/authenticate',
                        type: 'auto.generate.jwt.key.secret',
                    });
                    return privateKey;
                });
                this.secret = async () => {
                    return key;
                };
                return key;
            },
            async public() {
                const secret = await this.secret();
                const key = await Promise.try(function () {
                    const publicKey = crypto
                        .createPublicKey(secret)
                        ;
                    app.emit('event', {
                        source: '/authenticate',
                        type: 'auto.generate.jwt.key.public',
                    });
                    return publicKey;
                });
                this.public = async () => {
                    return key;
                };
                return key;
            },
            issuer() {
                return process.env.JWT_ISSUER
                    ?? manifest.name
                    ;
            },
            expire() {
                return process.env.JWT_EXPIRE
                    ?? '5min'
                    ;
            },
            async decode(token, options) {
                try {
                    const key = await this.public();
                    const info = jsonwebtoken.verify(token, key, {
                        algorithms: ['RS256'],
                        issuer: this.issuer(),
                        ...options,
                    });
                    if (!info) {
                        throw Error.build({
                            message: 'fail to decoded token',
                            name: Error.Code.InvalidToken,
                            status: 401,
                        });
                    }
                    return info as never;
                } catch (e) {
                    if (e instanceof jsonwebtoken.TokenExpiredError) {
                        throw Error.build({
                            message: e.message,
                            name: Error.Code.TokenExpired,
                            status: 401,
                            reason: e,
                        });
                    }
                    if (e instanceof jsonwebtoken.JsonWebTokenError) {
                        throw Error.build({
                            message: e.message,
                            name: Error.Code.InvalidToken,
                            status: 401,
                            reason: e,
                        });
                    }
                    throw e;
                }
            },
            async encode(info, options) {
                const key = await this.secret();
                return jsonwebtoken.sign(info, key, {
                    algorithm: 'RS256',
                    issuer: this.issuer(),
                    expiresIn: this.expire(),
                    ...options,
                });
            },
        };
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            @default manifest.name
            */
            readonly JWT_ISSUER?: string
            /**
            @default 5min
            */
            readonly JWT_EXPIRE?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'jwt'): Crypto
        }
    }
}
interface Crypto {
    secret(): Promise<KeyObject>
    public(): Promise<KeyObject>
    issuer(): string
    /**
    default value of expire
    */
    expire(): string
    decode<V extends object>(token: string, options?: jsonwebtoken.VerifyOptions): Promise<V>
    encode<V extends object>(info: V, options?: jsonwebtoken.SignOptions): Promise<string>
}