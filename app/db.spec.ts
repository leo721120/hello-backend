import express from '@io/lib/express'
//
describe('db', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.query', async function () {
        const db = await app.service('db');
        await db.authenticate();
    });
    it('.define', async function () {
        const db = await app.service('db');
        const tbl = db.define('testonly', {
            id: {
                type: db.Sequelize.DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: db.Sequelize.DataTypes.TEXT,
                allowNull: false,
            },
        });
        await tbl.bulkCreate([
            {
                id: 'abc001',
                name: 'abc',
            },
            {
                id: 'abc002',
                name: 'abc2',
            },
        ]);
        const list = await tbl.findAll({
            attributes: ['id', 'name'],
        });
        expect(list.map(function (item) {
            return item.toJSON();
        })).toEqual([{
            id: 'abc001',
            name: 'abc',
        }, {
            id: 'abc002',
            name: 'abc2',
        }]);
    });
});