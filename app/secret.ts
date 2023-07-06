import express from '@io/app/express'
import crypto from 'node:crypto'
import path from 'node:path'
import fs from 'fs-extra'
import os from 'node:os'
import '@io/lib/os'
export default express.service(function (app) {
    Object.assign(app, <typeof app>{
        secret(name) {
            return app.service('secret').secret(name);
        },
    }).service<Service>('secret', function () {
        const home = process.env.SECRET_HOME ?? './key';

        return {
            secret(name) {
                const iv = name.buffer().md5('hex');
                const url = path.join(home, iv);
                const algo = 'aes-256-cbc';
                const key = async function () {
                    const key = await os.uuid();
                    return key
                        .buffer()
                        .md5('hex')
                        ;
                };
                return {
                    async get<V>() {
                        return new Promise<Buffer>(function (done, fail) {
                            fs.readFile(url, function (err, data) {
                                return err ? fail(err) : done(data);
                            });
                        }).then(async function (data) {
                            const json = JSON.parse(data.toString('utf8')) as Secret;
                            const cipher = crypto.createDecipheriv(algo, await key(), iv.buffer('hex'));
                            const text = cipher.update(json.data, 'hex', 'utf8') + cipher.final('utf8');
                            return JSON.parse(text) as V;
                        }).catch(function (e: Error) {
                            if (e.code === 'ENOENT') {
                                return undefined;
                            }
                            throw e;
                        });
                    },
                    async set(value) {
                        const text = JSON.stringify(value);
                        const cipher = crypto.createCipheriv(algo, await key(), iv.buffer('hex'));
                        const data = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
                        const json = JSON.stringify(<Secret>{
                            data,
                        });
                        return new Promise<void>(function (done, fail) {
                            fs.outputFile(url, json, function (err) {
                                return err ? fail(err) : done();
                            });
                        });
                    },
                    async del() {
                        return new Promise<void>(function (done, fail) {
                            fs.unlink(url, function (err) {
                                if (!err) {
                                    return done();
                                } else if (err.code === 'ENOENT') {
                                    return done();// already deleted
                                } else {
                                    return fail(err);
                                }
                            });
                        });
                    },
                    async has() {
                        return new Promise<boolean>(function (done, fail) {
                            fs.access(url, fs.constants.R_OK | fs.constants.O_RDONLY, function (err) {
                                if (!err) {
                                    return done(true);
                                } else if (err.code === 'ENOENT') {
                                    return done(false);
                                } else {
                                    return fail(err);
                                }
                            });
                        });
                    },
                };
            },
        };
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            path to store secrets
            */
            readonly SECRET_HOME?: string | './key'
        }
    }
    namespace Express {
        interface Application {
            secret<V>(name: string): Crypto<V>
            service(name: 'secret'): Service
        }
    }
}
interface Secret {
    readonly algo?: 'aes-256-cbc'

    readonly sign?: string

    readonly data: string
}
interface Crypto<V> {
    get(): Promise<V | undefined>
    set(value: V): Promise<void>
    del(): Promise<void>
    has(): Promise<boolean>
}
interface Service {
    secret<V>(name: string): Crypto<V>
}