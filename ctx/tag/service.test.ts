import express from '@io/lib/express'
//
describe('tag', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        {
            const service = await app.service('tag');
            const db = await service.model();
            const [T1, T2, P3] = await db.bulkCreate([
                {
                    id: 'T-1',
                },
                {
                    id: 'T-2',
                },
                {
                    id: 'P-3',
                },
            ]);
            await T1.addParents([
                P3,
            ]);
            await T2.createResource({
                id: 'R-0',
                type: 'Some',
            });
        }
    });
    describe('.list', function () {
        it('', async function () {
            const service = await app.service('tag');
            const list = await service.list();
            expect(list).toEqual([{
                id: 'T-1',
                parents: [{
                    id: 'P-3',
                }],
                resource: null,
            }, {
                id: 'T-2',
                parents: [],
                resource: {
                    id: 'R-0',
                    type: 'Some',
                },
            }, {
                id: 'P-3',
                parents: [],
                resource: null,
            }]);
        });
        it('with fields', async function () {
            const service = await app.service('tag');
            const list = await service.list('id');
            expect(list).toEqual([{
                id: 'T-1',
            }, {
                id: 'T-2',
            }, {
                id: 'P-3',
            }]);
        });
    });
});