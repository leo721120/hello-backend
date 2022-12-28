import * as sequelize from 'sequelize'
export * from 'sequelize'
export default {
    instance(options: sequelize.Options) {
        return new sequelize.Sequelize({
            dialect: 'sqlite',
            host: 'localhost',
            port: 5432,
            ...options,
        }).addHook('afterDefine', function (Model: sequelize.ModelStatic<sequelize.Model>) {
            const table = {
                autosync(params: sequelize.SyncOptions) {
                    const autosync = this.autosync as {
                        job?: Promise<unknown>
                    };
                    autosync.job ??= Promise.resolve().then(async function () {
                        if (options.schema) {
                            // sequelize use 'create schema if not exist' after got database version
                            await Model.sequelize?.databaseVersion();
                            await Model.sequelize?.createSchema(options.schema, {
                                ...params,
                            });
                        }
                        await Model.sync({
                            ...params,
                        });
                    }).catch(function (e) {
                        autosync.job = undefined;
                        throw e;
                    });
                    return autosync.job;
                },
            };
            Model.addHook('beforeBulkDestroy', async function (options) {
                await table.autosync(options);
            }).addHook('beforeBulkRestore', async function (options) {
                await table.autosync(options);
            }).addHook('beforeBulkUpdate', async function (options) {
                await table.autosync(options);
            }).addHook('beforeBulkCreate', async function (instances, options) {
                await table.autosync(options);
            }).addHook('beforeBulkSync', async function (options) {
                await table.autosync(options);
            }).addHook('beforeDestroy', async function (instance, options) {
                await table.autosync(options);
            }).addHook('beforeRestore', async function (instance, options) {
                await table.autosync(options);
            }).addHook('beforeUpdate', async function (instance, options) {
                await table.autosync(options);
            }).addHook('beforeCreate', async function (instance, options) {
                await table.autosync(options);
            }).addHook('beforeUpsert', async function (instance, options) {
                await table.autosync(options);
            }).addHook('beforeCount', async function (options) {
                await table.autosync(options);
            }).addHook('beforeSave', async function (instance, options) {
                await table.autosync(options);
            }).addHook('beforeFind', async function (options) {
                await table.autosync(options);
            }).addHook('afterSync', async function (options) {
                Object.assign(table, <typeof table>{
                    async autosync() {
                    },
                });
            });
        });
    },
}