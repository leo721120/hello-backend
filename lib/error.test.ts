import '@io/lib/error'
//
describe('error', function () {
    it('.code', async function () {
        const e = Error.Code({
            name: SyntaxError.name,
            message: 'test for error',
            errno: 1234,
        });
        const fn = function () {
            throw e;
        };
        expect(fn).toThrow(e);
    });
});