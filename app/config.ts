import type { FindOptions } from '@io/lib/sequelize'
import { Model as Table } from '@io/lib/sequelize'
import express from '@io/app/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/configs/:name', async function (req, res) {
        const tracecontext = req.tracecontext();
        const user = await req.authenticate();
        const iam = app.service('iam');
        await iam.is(user).can('read:config').in({ tracecontext });
        const name = req.parameter('name');
        const Model = app.service('config/model');
        const config = await Model.query({
            tracecontext
        }).findOne({
            where: { name },
            rejectOnEmpty: Error.build({
                message: 'config not found',
                name: 'NotFound',
                status: 404,
                params: { name },
            }),
        });
        res.status(200).json(config.get().data);
    }).put('/configs/:name', express.json(), async function (req, res) {
        const tracecontext = req.tracecontext();
        const user = await req.authenticate();
        const iam = app.service('iam');
        await iam.is(user).can('edit:config').in({ tracecontext });
        const name = req.parameter('name');
        const data = req.content('application/json');
        const Model = app.service('config/model');
        const [,] = await Model.query({
            tracecontext
        }).upsert({
            name,
            data,
        });
        res.status(204).end();
    }).delete('/configs/:name', async function (req, res) {
        const tracecontext = req.tracecontext();
        const user = await req.authenticate();
        const iam = app.service('iam');
        await iam.is(user).can('edit:config').in({ tracecontext });
        const name = req.parameter('name');
        const Model = app.service('config/model');
        await Model.query({
            tracecontext
        }).destroy({
            where: { name },
        });
        res.status(204).end();
    }).service<typeof Model>('config/model', function () {
        const db = app.service('db');

        Model.init(
            {
                name: {
                    type: db.DataTypes.TEXT,
                    primaryKey: true,
                    allowNull: false,
                },
                data: {
                    type: db.DataTypes.JSON,
                    allowNull: false,
                },
            },
            {
                //comment: '',
                modelName: 'config',
                sequelize: db,
            },
        );
        Model.addScope('query', function (m: Model, a: FindOptions) {
            const p = m as {
                readonly _scope?: object
            };
            return {
                ...p._scope,
                ...a,
            };
        });
        function autosync(options: object) {
            const lock = autosync as {
                job?: Promise<unknown>
            };
            lock.job ??= Promise.try(async function () {
                await Model.sync(options);
            }).catch(function (e) {
                lock.job = undefined;// reset for retry
                throw e;
            });
            return lock.job;
        }
        Model.addHook('beforeBulkDestroy', 'auto-sync', async function (options) {
            await autosync(options);
        }).addHook('beforeBulkRestore', 'auto-sync', async function (options) {
            await autosync(options);
        }).addHook('beforeBulkUpdate', 'auto-sync', async function (options) {
            await autosync(options);
        }).addHook('beforeBulkCreate', 'auto-sync', async function (instances, options) {
            await autosync(options);
        }).addHook('beforeBulkSync', 'auto-sync', async function (options) {
            await autosync(options);
        }).addHook('beforeDestroy', 'auto-sync', async function (instance, options) {
            await autosync(options);
        }).addHook('beforeRestore', 'auto-sync', async function (instance, options) {
            await autosync(options);
        }).addHook('beforeUpdate', 'auto-sync', async function (instance, options) {
            await autosync(options);
        }).addHook('beforeCreate', 'auto-sync', async function (instance, options) {
            await autosync(options);
        }).addHook('beforeUpsert', 'auto-sync', async function (instance, options) {
            await autosync(options);
        }).addHook('beforeCount', 'auto-sync', async function (options) {
            await autosync(options);
        }).addHook('beforeSave', 'auto-sync', async function (instance, options) {
            await autosync(options);
        }).addHook('beforeFind', 'auto-sync', async function (options) {
            await autosync(options);
        }).addHook('afterSync', 'auto-sync', async function (options) {
        });
        return Model;
    }).authorize('read:config', async function (user, auth) {
        //TODO:
    }).authorize('edit:config', async function (user, auth) {
        //TODO:
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'config/model'): typeof Model
        }
    }
}
interface Config {
    readonly name: string

    readonly data: unknown
}
class Model extends Table<Config> {
    static query(options: FindOptions<never>) {
        return this.scope({
            method: ['query', this, options],
        }) as typeof Model;
    }
}