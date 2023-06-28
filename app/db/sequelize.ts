import sequelize, { Sequelize } from '@io/lib/sequelize'
import express from '@io/app/express'
import '@io/lib/event'
import '@io/lib/node'
import 'pg'// force pkg to include
export default express.service(function (app) {
    app.service('db', function () {
        const uri = new URL(process.env.SEQUELIZE_HREF ?? 'sqlite::memory:');

        Sequelize.beforeInit('init-db', function (config, options) {
            Object.assign(uri, <typeof uri>{// omit sensitive information
                password: '',
            });
            app.emit('event', {
                source: uri.toString(),
                type: 'db',
            });
        });
        Sequelize.afterInit('init-db', function (db) {
            app.once('close', function () {
                // force close if application is going down
                db.close();
            });
        });
        return sequelize({
            ...JSON.parse(process.env.SEQUELIZE_OPTIONS ?? '{}'),
            schema: process.env.SEQUELIZE_SCHEMA,
            uri: uri.toString(),
            benchmark: true,
            logging(text, elapse) {
                {
                    this.tracecontext?.servertiming?.('db');
                }
                app.emit('event', {
                    ...this.tracecontext as CloudEvent<never>,
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
        readonly tracecontext?: CloudEvent<string>
    }
}
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            @default sqlite::memory:
            */
            readonly SEQUELIZE_HREF?: string
            readonly SEQUELIZE_SCHEMA?: string
            readonly SEQUELIZE_OPTIONS?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'db'): ReturnType<typeof sequelize>
        }
    }
}