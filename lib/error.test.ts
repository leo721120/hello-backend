import '@io/lib/error'
//
describe('error', function () {
    it('.build', function () {
        const e = Error.build({
            message: 'test for error',
            name: 'TestOnly',
            status: 400,
        });
        const fn = function () {
            throw e;
        };
        expect(fn).toThrow(e);
    });
    it('.code', function () {
        const list = Object.keys(Error.Code);

        for (const code of list) {
            expect(Error.Code[code as never]).toBe(code);
        }
    });
});