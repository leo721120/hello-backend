import sequelize, { Model } from '@io/lib/sequelize'
//
describe('sequelize', function () {
    it('.instance', async function () {
        const db = sequelize({
            define: { underscored: true },
            database: 'testonly',
            logging: false,
        });
        interface Record {
            readonly id: string
            readonly name: string
        }
        interface Table extends Model<Record> {
        };
        const Table = db.define<Table>('table', {
            id: {
                type: db.DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: db.DataTypes.TEXT,
                allowNull: false,
            },
        });
        await Table.sync({// create table if not exists
        });
        await Table.bulkCreate([
            {
                id: 'abc001',
                name: 'abc',
            },
            {
                id: 'abc002',
                name: 'abc2',
            },
        ]);
        const list = await Table.findAll({
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