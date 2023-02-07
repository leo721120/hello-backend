import express from '@io/lib/express'
//
describe('mongo', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await app.setup(await import('@io/app/domain.mock'));
    });
    afterAll(async function () {
        app.emit('close');// stop internal services
    });
    it('.insert', async function () {
        const mongo = await app.service('mongo');
        const db = mongo.db().collection('testonly');
        const res = await db.insertMany([{
            a: 1,
        }, {
            b: '2',
        }]);
        expect(res.insertedCount).toBe(2);
    });
});