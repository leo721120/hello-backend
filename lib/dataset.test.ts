import dataset from '@io/lib/dataset'
//
describe('dataset', function () {
    it('.find, can be reset', async function () {
        const set = dataset();
        const called = [];
        set.feed('abc', async function () {
            called.push(called.length);
            return called.length;
        });
        {
            const a = await set.find('abc');
            expect(a).toBe(1);
            expect(called.length).toBe(1);
        }
        set.drop('abc');
        {
            const a = await set.find('abc');
            expect(a).toBe(2);
            expect(called.length).toBe(2);
        }
    });
    it('.find, not exist', async function () {
        const set = dataset();
        const a = await set.find('abc');
        expect(a).toBeUndefined();
    });
    it('.find, return cached', async function () {
        const set = dataset();
        const called = [];
        set.feed('abc', async function () {
            called.push(true);
            return 179;
        });
        for (let i = 0; i < 10; i++) {
            const a = await set.find('abc');
            expect(a).toBe(179);
        }
        expect(called.length).toBe(1);
    });
    it('.find', async function () {
        const set = dataset();
        set.feed('abc', async function () {
            return 179;
        });
        const a = await set.find('abc');
        expect(a).toBe(179);
    });
});