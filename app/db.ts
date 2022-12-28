import { Sequelize } from '@io/lib/sequelize'
import sequelize from '@io/lib/sequelize'
import express from '@io/lib/express'
import 'pg'// force pkg to include this
export interface Service extends ReturnType<typeof sequelize.instance> {
}
export default express.setup(function (app) {
    Sequelize.beforeInit('init-db', function (config) {
        app.emit('event', {
            ...config,
            password: '****',
        });
    });
    app.service('db', async function () {
        const options = async function () {
            if (process.env.SEQUELIZE_SECRET?.length) {
                const dapr = await app.service('dapr');
                const secret = await dapr.secret<object>({
                    secretstore: 'secretstore',
                    key: process.env.SEQUELIZE_SECRET,
                });
                return secret.data;
            }
            return {
            };
        };
        return sequelize.instance({
            database: 'dev',
            // default is memory mode for develop
            dialect: 'sqlite',
            schema: 'dev',
            ...await options(),
            benchmark: true,
            logging(text, elapse) {
                app.emit('event', {
                    name: this.tracecontext?.traceparent(),
                    elapse,
                    text,
                });
            },
            define: {
                underscored: true,
                timestamps: false,
            },
            pool: {
                max: 4,
                min: 1,
            },
            hooks: {
            },
        });
    });
});
declare module 'sequelize' {
    interface Logging {
        /**
        context for tracking
        */
        readonly tracecontext?: TraceContext
    }
}
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            key to read from secret store, omit if switch to sqlite for develop
            */
            readonly SEQUELIZE_SECRET?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'db'): Promise<Service>
        }
    }
}