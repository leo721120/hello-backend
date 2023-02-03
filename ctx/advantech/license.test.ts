import license from '@io/ctx/advantech/license'
//
describe('advantech', function () {
    describe('license', function () {
        it('.summary.extract', async function () {
            const product = '';
            const payload = Buffer.from('abc');
            const e = await license.summary.extract(product, payload).catch<Error>(e => e);
            expect(e).toEqual(expect.objectContaining({
                message: 'fail to extract summary from license payload',
                name: 'DecryptFailed',
                errno: -4,
            }));
        });
    });
});