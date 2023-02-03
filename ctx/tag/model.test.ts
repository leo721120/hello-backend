import sequelize from '@io/lib/sequelize'
import tag from '@io/ctx/tag/model'
import '@io/lib/node'
//
describe('tag', function () {
    const db = sequelize({
        benchmark: true,
        logging: false,
        database: 'e2e',
        username: 'e2e',
        password: 'e2e',
        schema: 'dev',
        define: {
            underscored: true,
            timestamps: false,
        },
        pool: {
            max: 2,
            min: 1,
        },
        hooks: {
        },
    });
    afterAll(async function () {
        await db.close();
    });
    beforeAll(async function () {
        const Model = tag.model(db);
        const [L1, DL1, D1, D2, LL1, D3] = await Model.bulkCreate([
            {
                id: 'L1-1',
            },
            {
                id: 'DL1-1',
            },
            {
                id: 'D1',
            },
            {
                id: 'D2',
            },
            {
                id: 'LL-1',
            },
            {
                id: 'D3',
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
    });
    it('find item with parents', async function () {
        const Model = tag.model(db);
        const item = await Model.scope('parents').findOne({
            rejectOnEmpty: true,
            //
            where: {
                id: 'D1',
            },
        });
        expect(item.toJSON()).toEqual({
            id: 'D1',
            parents: [
                {
                    id: 'L1-1',
                },
                {
                    id: 'DL1-1',
                },
            ],
        });
    });
    it('find item with resource', async function () {
        const Model = tag.model(db);
        const item = await Model.scope('resource').findOne({
            rejectOnEmpty: true,
            //
            where: {
                id: 'D1',
            },
        });
        expect(item.toJSON()).toEqual({
            id: 'D1',
            resource: {
                id: 'did:1',
                type: 'Device',
            },
        });
    });
    it('list all items under parent', async function () {
        const Model = tag.model(db);
        const list = await Model.allChilds({
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
    it('list items by resource type', async function () {
        const Model = tag.model(db);
        const list = await Model.scope('resource').findAll({
            include: [{
                association: Model.associations.resource,
                //
                where: {
                    type: 'Device',
                },
            }],
        });
        expect(list).toHaveLength(3);
        expect(list[0].toJSON()).toEqual({
            id: 'D1',
            resource: {
                id: 'did:1',
                type: 'Device',
            },
        });
        expect(list[1].toJSON()).toEqual({
            id: 'D2',
            resource: {
                id: 'did:2',
                type: 'Device',
            },
        });
        expect(list[2].toJSON()).toEqual({
            id: 'D3',
            resource: {
                id: 'did:3',
                type: 'Device',
            },
        });
    });
});