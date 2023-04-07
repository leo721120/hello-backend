import '@io/lib/error'
//
describe('error', function () {
    it('.code', async function () {
        const e = Error.$({
            message: 'test for error',
            name: SyntaxError.name,
            status: 400,
        });
        const fn = function () {
            throw e;
        };
        expect(fn).toThrow(e);
    });
});