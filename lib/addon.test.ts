import addon from '@io/lib/addon'
//
describe('addon', function () {
    it('.hello', async function () {
        expect(addon.hello()).toBe('world');
    });
});