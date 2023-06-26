import type { BelongsToManyRemoveAssociationsMixin } from '@io/lib/sequelize'
import type { BelongsToManyRemoveAssociationMixin } from '@io/lib/sequelize'
import type { BelongsToManyCreateAssociationMixin } from '@io/lib/sequelize'
import type { BelongsToManyCountAssociationsMixin } from '@io/lib/sequelize'
import type { BelongsToManySetAssociationsMixin } from '@io/lib/sequelize'
import type { BelongsToManyGetAssociationsMixin } from '@io/lib/sequelize'
import type { BelongsToManyHasAssociationsMixin } from '@io/lib/sequelize'
import type { BelongsToManyAddAssociationsMixin } from '@io/lib/sequelize'
import type { BelongsToManyHasAssociationMixin } from '@io/lib/sequelize'
import type { BelongsToManyAddAssociationMixin } from '@io/lib/sequelize'
import type { HasOneCreateAssociationMixin } from '@io/lib/sequelize'
import type { HasOneGetAssociationMixin } from '@io/lib/sequelize'
import type { HasOneSetAssociationMixin } from '@io/lib/sequelize'
import type { SyncOptions } from '@io/lib/sequelize'
import type { FindOptions } from '@io/lib/sequelize'
import type { Association } from '@io/lib/sequelize'
import { Model as Table } from '@io/lib/sequelize'
import express from '@io/app/express'
export * from '@io/lib/sequelize'
export interface Resource {
    readonly type: string
    readonly id: string
}
export interface Tag {
    readonly id: string
    readonly name?: string
    readonly parents?: readonly Tag[]
    readonly resource?: Resource
}
export default express.service(function (app) {
    app.service('tag/model', function () {
        const db = app.service('db');
        {// main
            Model.init(
                {
                    id: {
                        type: db.DataTypes.TEXT,
                        primaryKey: true,
                        allowNull: false,
                    },
                    name: {
                        type: db.DataTypes.TEXT,
                        allowNull: false,
                    },
                },
                {
                    comment: 'basic informations of tag',
                    modelName: 'tag',
                    sequelize: db,
                    defaultScope: {
                        attributes: ['id'],
                    },
                    scopes: {
                        query(m: Model, a: FindOptions<Tag>) {
                            const p = m as {
                                readonly _scope?: object
                            };
                            return {
                                ...p._scope,
                                ...a,
                            };
                        },
                    },
                },
            );
        }
        {// submodel
            RelationModel.init(
                {
                },
                {
                    sequelize: db,
                    modelName: 'tag_relation',
                    comment: 'relationship between tags',
                },
            );
            Model.belongsToMany(Model, {
                otherKey: 'parent',// change PK2 name to this
                foreignKey: 'tag',// change PK1 name to this
                as: 'parents',// field name for Model
                through: RelationModel,
            });
        }
        {// submodel
            ResourceModel.init(
                {
                    type: {
                        type: db.DataTypes.TEXT,
                        primaryKey: true,
                        allowNull: false,
                    },
                    id: {
                        type: db.DataTypes.TEXT,
                        primaryKey: true,
                        allowNull: false,
                    },
                },
                {
                    sequelize: db,
                    modelName: 'tag_resource',
                    comment: 'relationship between tag and resource',
                },
            );
            Model.hasOne(ResourceModel, {
                foreignKey: 'tag',// foreign to tag.id
                as: 'resource',// field name for Model
            });
        }
        function autosync(options: SyncOptions) {
            const lock = autosync as {
                job?: Promise<unknown>
            };
            lock.job ??= Promise.resolve().then(async function () {
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
            await ResourceModel.sync(options);
            await RelationModel.sync(options);
        });
        return Model;
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'tag/model'): typeof Model
        }
    }
}
class ResourceModel extends Table<Resource> {
}
class RelationModel extends Table<object> {
}
class Model extends Table<Tag> {
    declare getParents: BelongsToManyGetAssociationsMixin<Table>
    declare setParents: BelongsToManySetAssociationsMixin<Table, string>
    declare addParents: BelongsToManyAddAssociationsMixin<Table, string>
    declare addParent: BelongsToManyAddAssociationMixin<Table, string>
    declare createParent: BelongsToManyCreateAssociationMixin<Table>
    declare removeParent: BelongsToManyRemoveAssociationMixin<Table, string>
    declare removeParents: BelongsToManyRemoveAssociationsMixin<Table, string>
    declare hasParent: BelongsToManyHasAssociationMixin<Table, string>
    declare hasParents: BelongsToManyHasAssociationsMixin<Table, string>
    declare countParent: BelongsToManyCountAssociationsMixin
    //
    declare getResource: HasOneGetAssociationMixin<ResourceModel>
    declare setResource: HasOneSetAssociationMixin<ResourceModel, string>
    declare createResource: HasOneCreateAssociationMixin<ResourceModel>
    declare static associations: {
        readonly resource: Association<Model, ResourceModel>
        readonly parents: Association<Model, RelationModel>
    }
    /**
    return all childs under this node
    */
    static async allChilds(options: FindOptions<unknown> & {
        readonly where: Pick<Tag, 'id'> & {
            /**
            type of resource in child
            */
            readonly type?: string
            /**
            maximum recursive level, omit if infinite
            */
            readonly level?: number
        }
    }): Promise<readonly Model[]> {
        const db = this.sequelize!;
        const query = db.getQueryInterface();
        const quote = query.queryGenerator as typeof query;
        const beginning = quote.escape(options.where.id);
        const tbl_tag = quote.quoteTable(Model.getTableName());
        const tbl_resource = quote.quoteTable(ResourceModel.getTableName());
        const tbl_relation = quote.quoteTable(RelationModel.getTableName());
        return db.query(`
            WITH RECURSIVE cte_q AS (
                SELECT e.id, s.type, r.parent, 0 as level
                FROM ${tbl_tag} e
                LEFT JOIN ${tbl_resource} s ON e.id = s.tag
                LEFT JOIN ${tbl_relation} r ON e.id = r.tag
                WHERE e.id = ${beginning}
                UNION ALL
                SELECT e.id, s.type, r.parent, level + 1
                FROM ${tbl_tag} e
                LEFT JOIN ${tbl_resource} s ON e.id = s.tag
                LEFT JOIN ${tbl_relation} r ON e.id = r.tag
                INNER JOIN cte_q q ON q.id = r.parent
            )

            SELECT id FROM cte_q
            WHERE id != ${beginning}

            ${options.where.type?.length
                ? `AND cte_q.type = '${options.where.type}'`
                : ''
            }
            ${options.where.level
                ? `AND cte_q.level <= ${options.where.level}`
                : ''
            }
        `, {
            mapToModel: true,
            model: Model,
        });
    }
    static query(options: FindOptions<never>) {
        return this.scope({
            method: ['query', this, options],
        }) as typeof this;
    }
    static where(params: {
        //readonly resource?: readonly Resource['id'][]
        //readonly parent?: readonly Tag['id'][]
        readonly type?: readonly Resource['type'][]
        readonly id?: readonly Tag['id'][]
    }) {
        const o = <FindOptions<Tag>>{
            include: [],
        };
        if (params.id?.length) {
            o.where = {
                ...o.where,
                id: params.id,
            };
        };
        if (params.type?.length) {
            o.include = [...o.include as [], {
                association: Model.associations.resource,
                attributes: [],
                where: { type: params.type },
            }];
        };
        return this.scope({
            method: ['query', this, o],
        }) as typeof this;
    }
    static select(fields: (keyof Tag)[]) {
        const attrs = Object.keys(this.getAttributes()) as [];
        const all = !fields.length;
        const o = <FindOptions<never>>{
            include: [],
            attributes: all
                ? attrs
                : fields.intersection(attrs).concat('id'),
        };
        if (all || fields.includes('parents')) {
            o.include = [...o.include as [], {
                association: Model.associations.parents,
                through: { attributes: [] },
            }];
        }
        if (all || fields.includes('resource')) {
            o.include = [...o.include as [], {
                association: Model.associations.resource,
                attributes: { exclude: ['tag'] },
            }];
        }
        return this.findAll({
            ...o,
        });
    }
}