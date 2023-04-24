import express from '@io/lib/express'
//
describe('tag/model', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    beforeAll(async function () {
        try {
            const model = app.service('tag/model');
            //await model.sync({ force: true });
            const [L1, DL1, D1, D2, LL1, D3] = await model.bulkCreate([
                {
                    id: 'L1-1',
                    name: 'L1',
                },
                {
                    id: 'DL1-1',
                    name: 'DL1',
                },
                {
                    id: 'D1',
                    name: 'D1',
                },
                {
                    id: 'D2',
                    name: 'D2',
                },
                {
                    id: 'LL-1',
                    name: 'LL1',
                },
                {
                    id: 'D3',
                    name: 'D3',
                },
            ]);
            await D1.addParents([
                L1, DL1,
            ]);
            await D1.createResource({
                id: 'did:1',
                type: 'Device',
            });
            await D2.createResource({
                id: 'did:2',
                type: 'Device',
            });
            await L1.createResource({
                id: 'L:1',
                type: 'Location',
            });
            await DL1.createResource({
                id: 'DL:1',
                type: 'DeviceLabel1',
            });
            await L1.addParents([
                LL1,
            ]);
            await LL1.createResource({
                id: 'LL:1',
                type: 'LocationLabel1',
            });
            await D3.addParents([
                L1, DL1,
            ]);
            await D3.createResource({
                id: 'did:3',
                type: 'Device',
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    });
    describe('.where', function () {
        it('id=[]', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    id: ['D1'],
                })
                .findAll({
                    attributes: ['id'],
                    limit: 1,
                }).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                id: 'D1',
            });
        });
        it('type=[]', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    type: ['Device'],
                })
                .findAll({
                    attributes: ['id'],
                    limit: 1,
                }).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                id: 'D1',
            });
        });
    });
    describe('.select', function () {
        it('[id, name]', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    id: ['D1'],
                })
                .select([
                    'name',
                    'id',
                ]).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                name: 'D1',
                id: 'D1',
            });
        });
        it('[id, parents]', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    id: ['D1'],
                })
                .select([
                    'parents',
                    'id',
                ]).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                id: 'D1',
                parents: [{
                    id: 'L1-1',
                }, {
                    id: 'DL1-1',
                }],
            });
        });
        it('[id, resource]', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    id: ['D1'],
                })
                .select([
                    'resource',
                    'id',
                ]).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                id: 'D1',
                resource: {
                    type: 'Device',
                    id: 'did:1',
                },
            });
        });
        it('[name], auto append [id]', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    id: ['D1'],
                })
                .select([
                    'name',
                ]).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                name: 'D1',
                id: 'D1',
            });
        });
        it('[], select all', async function () {
            const [item] = await app
                .service('tag/model')
                .where({
                    id: ['D1'],
                })
                .select([
                    //
                ]).map(function (row) {
                    return row.toJSON();
                });
            expect(item).toEqual({
                name: 'D1',
                id: 'D1',
                parents: [{
                    id: 'L1-1',
                }, {
                    id: 'DL1-1',
                }],
                resource: {
                    type: 'Device',
                    id: 'did:1',
                },
            });
        });
    });
    it('.query(limit).where(type).select(id)', async function () {
        const list = await app
            .service('tag/model')
            .query({ limit: 2 })
            .where({ type: ['Device'] })
            .select(['id'])
            .map(row => row.toJSON())
            ;
        expect(list).toHaveLength(2);
        expect(list).toEqual([
            {
                id: 'D1',
            },
            {
                id: 'D2',
            },
        ]);
    });
    it('.where(id, type).select(id, parents)', async function () {
        const [item] = await app
            .service('tag/model')
            .where({
                type: ['Device'],
                id: ['D1'],
            })
            .select([
                'parents',
                'id',
            ]).map(function (row) {
                return row.toJSON();
            });
        expect(item).toEqual({
            id: 'D1',
            parents: [{
                id: 'DL1-1',
            }, {
                id: 'L1-1',
            }],
        });
    });
    it('.where(type).select(id, parents)', async function () {
        const list = await app
            .service('tag/model')
            .where({
                type: ['Device'],
            })
            .select([
                'parents',
                'id',
            ]).map(function (row) {
                return row.toJSON();
            });
        expect(list).toHaveLength(3);
    });
    /*
    it('list all tags under parent', async function () {
        const model = app.service('tag/model');
        const list = await model.allChilds({
            where: { id: 'LL-1' },
        });
        expect(list).toHaveLength(3);
        expect(list[0].toJSON()).toEqual({
            id: 'L1-1',
        });
        expect(list[1].toJSON()).toEqual({
            id: 'D1',
        });
        expect(list[2].toJSON()).toEqual({
            id: 'D3',
        });
    });
    it.skip('.', async function () {
        const model = app.service('tag/model');
        const list = await model.findAll({
            logging: console.log,
            //where: { id: 'LL-1' },
            where: { id: 'D1' },
            include: [{
                nested: true,
                association: model.associations.parents,
                through: { attributes: [] },
                include: [{
                    nested: true,
                    association: model.associations.parents,
                    through: { attributes: [] },
                }],
                //all: true,
            }],
        });
        expect(list).toHaveLength(3);
        expect(list[0].toJSON()).toEqual({
            id: 'L1-1',
        });
        expect(list[1].toJSON()).toEqual({
            id: 'D1',
        });
        expect(list[2].toJSON()).toEqual({
            id: 'D3',
        });
    });*/
});
//
/*describe('tag', function () {
    
    
    it('list all items by resource type under parent', async function () {
        const Model = tag.model(db);
        const list = await Model.allChilds({
            where: { id: 'LL-1', restype: 'Device' },
        });
        expect(list).toHaveLength(2);
        expect(list[0].toJSON()).toEqual({
            id: 'D1',
        });
        expect(list[1].toJSON()).toEqual({
            id: 'D3',
        });
    });
    it('list all items by level under parent', async function () {
        const Model = tag.model(db);
        const list = await Model.allChilds({
            where: { id: 'LL-1', level: 1 },
        });
        expect(list).toHaveLength(1);
        expect(list[0].toJSON()).toEqual({
            id: 'L1-1',
        });
    });
    
});*/