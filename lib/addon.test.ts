import addon from '@io/lib/addon'
//
describe('addon', function () {
    it('.hello', async function () {
        expect(addon.hello('addon')).toBe('hello addon');
    });
    it('.cwd', async function () {
        const cwd = addon.cwd();
        const maybe = [
            process.cwd(),
            'unknown',// if not supported
        ];
        expect(maybe.includes(cwd)).toBeTruthy();
    });
});