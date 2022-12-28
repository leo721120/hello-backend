import * as sequelize from '@io/lib/sequelize'
export type Find<A> = sequelize.FindOptions<A>
export interface Tag {
    readonly id: string
    readonly parents?: readonly Tag[]
    readonly resource?: {
        readonly type: string
        readonly id: string
    }
}
export default {
    model(db: sequelize.Sequelize) {
        const modelName = 'tag_info';

        if (db.isDefined(modelName)) {
            return db.model(modelName) as typeof Model;
        }
        class ResourceModel extends sequelize.Model<Required<Tag>['resource']> {
        }
        class RelationModel extends sequelize.Model<{}> {
        }
        class Model extends sequelize.Model<Tag> {
            declare getParents: sequelize.BelongsToManyGetAssociationsMixin<Model>
            declare setParents: sequelize.BelongsToManySetAssociationsMixin<Model, string>
            declare addParents: sequelize.BelongsToManyAddAssociationsMixin<Model, string>
            declare addParent: sequelize.BelongsToManyAddAssociationMixin<Model, string>
            declare createParent: sequelize.BelongsToManyCreateAssociationMixin<Model>
            declare removeParent: sequelize.BelongsToManyRemoveAssociationMixin<Model, string>
            declare removeParents: sequelize.BelongsToManyRemoveAssociationsMixin<Model, string>
            declare hasParent: sequelize.BelongsToManyHasAssociationMixin<Model, string>
            declare hasParents: sequelize.BelongsToManyHasAssociationsMixin<Model, string>
            declare countParent: sequelize.BelongsToManyCountAssociationsMixin
            //
            declare getResource: sequelize.HasOneGetAssociationMixin<ResourceModel>
            declare setResource: sequelize.HasOneSetAssociationMixin<ResourceModel, string>
            declare createResource: sequelize.HasOneCreateAssociationMixin<ResourceModel>
            declare static associations: {
                readonly resource: sequelize.Association<Model, ResourceModel>
                readonly parents: sequelize.Association<Model, Model>
            }
            /**
            return all childs under this node
            */
            static async allChilds(options: sequelize.FindOptions<Tag> & {
                readonly where: Pick<Tag, 'id'> & {
                    /**
                    type of resource in child
                    */
                    readonly restype?: string
                    /**
                    maximum recursive level, omit if infinite
                    */
                    readonly level?: number
                }
            }): Promise<readonly Model[]> {
                const query = db.getQueryInterface();
                const quote = query.queryGenerator as typeof query;
                const begin = quote.escape(options.where.id);
                const tbl_tag = quote.quoteTable(Model.getTableName());
                const tbl_resource = quote.quoteTable(ResourceModel.getTableName());
                const tbl_relation = quote.quoteTable(RelationModel.getTableName());
                const where = await Promise.defer<string>(function () {
                    const query = [];

                    if (options.where.restype?.length) {
                        query.push(`AND cte_q.type = '${options.where.restype}'`);
                    }
                    if (options.where.level) {
                        query.push(`AND cte_q.level <= ${options.where.level}`);
                    }
                    return query.join('\n');
                });
                return db.query(`
                WITH RECURSIVE cte_q AS (
                    SELECT e.id, s.type, r.parent, 0 as level
                    FROM ${tbl_tag} e
                    LEFT JOIN ${tbl_resource} s ON e.id = s.tag
                    LEFT JOIN ${tbl_relation} r ON e.id = r.tag
                    WHERE e.id = ${begin}
                    UNION ALL
                    SELECT e.id, s.type, r.parent, level + 1
                    FROM ${tbl_tag} e
                    LEFT JOIN ${tbl_resource} s ON e.id = s.tag
                    LEFT JOIN ${tbl_relation} r ON e.id = r.tag
                    INNER JOIN cte_q q ON q.id = r.parent
                )
        
                SELECT id FROM cte_q
                WHERE id != ${begin}
                ${where}
                `, {
                    model: Model,
                    mapToModel: true,
                });
            }
        }
        Model.init(
            {
                id: {
                    type: sequelize.DataTypes.TEXT,
                    primaryKey: true,
                    allowNull: false,
                },
            },
            {
                sequelize: db,
                modelName,
                comment: 'basic informations of tag',
                scopes: {
                    resource() {
                        return {
                            include: [{
                                association: Model.associations.resource,
                                attributes: { exclude: ['tag'] },
                            }],
                        };
                    },
                    parents() {
                        return {
                            include: [{
                                association: Model.associations.parents,
                                through: { attributes: [] },
                            }],
                        };
                    },
                },
            }
        );
        RelationModel.init(
            {
            },
            {
                sequelize: db,
                modelName: 'tag_relation',
                comment: 'relationship between tags',
            }
        );
        Model.belongsToMany(Model, {
            otherKey: 'parent',// change PK2 name to this
            foreignKey: 'tag',// change PK1 name to this
            as: 'parents',// field name for Model
            through: RelationModel,
        });
        ResourceModel.init(
            {
                type: {
                    type: sequelize.DataTypes.TEXT,
                    primaryKey: true,
                    allowNull: false,
                },
                id: {
                    type: sequelize.DataTypes.TEXT,
                    primaryKey: true,
                    allowNull: false,
                },
            },
            {
                sequelize: db,
                modelName: 'tag_resource',
                comment: 'relationship between tag and resource',
            }
        );
        Model.hasOne(ResourceModel, {
            foreignKey: 'tag',// foreign to tag.id
            as: 'resource',// field name for Model
        });
        Model.afterSync(async function (options) {
            await RelationModel.sync(options);
            await ResourceModel.sync(options);
        });
        return Model;
    },
};