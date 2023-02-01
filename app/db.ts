import type { Options } from '@io/lib/sequelize'
import { Sequelize } from '@io/lib/sequelize'
import sequelize from '@io/lib/sequelize'
import express from '@io/lib/express'
import '@io/lib/node'
import 'pg'// force pkg to include
export default express.service(function (app) {
    app.service('db', async function () {
        const uri = new URL(process.env.SEQUELIZE_HREF ?? 'sqlite::memory:');
        const options = await Promise.try<Options>(function () {
            return {
                ...JSON.parse(process.env.SEQUELIZE_OPTIONS ?? '{}'),
                schema: process.env.SEQUELIZE_SCHEMA,
            };
        });
        Sequelize.beforeInit('init-db', function (config, options) {
            Object.assign(uri, <typeof uri>{// omit sensitive information
                password: '',
            });
            app.emit('event', CloudEvent({
                id: CloudEvent.EMPTY_ID,
                source: uri.toString(),
                data: undefined,
                type: 'db',
                text: 'connect',
            }));
        });
        Sequelize.afterInit('init-db', function (db) {
            app.once('close', function () {
                // force close if application is going down
                db.close();
            });
        });
        return sequelize.instance({
            ...options,
            uri: uri.toString(),
            benchmark: true,
            logging(text, elapse) {
                app.emit('event', {
                    ...this.cloudevent as CloudEvent<never>,
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
        readonly cloudevent?: CloudEvent<string>
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
            service(name: 'db'): Promise<ReturnType<typeof sequelize.instance>>
        }
    }
}