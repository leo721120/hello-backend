import dynlib from '@io/lib/dynlib'
//
describe('dynlib', function () {
    it('.load', async function () {
        const libname = process.platform === 'win32'
            ? 'msvcrt'
            : 'libc'
            ;
        const lib = dynlib(libname, {
            'atoi': ['int', ['string']]
        });
        const value = lib.atoi('1237');
        expect(value).toBe(1237);
    });
});