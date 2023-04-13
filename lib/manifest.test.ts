import manifest from '@io/lib/manifest'
//
describe('manifest', function () {
    it('.', async function () {
        expect(manifest).toEqual(
            expect.objectContaining({
                version: '0.0.0',
                name: '@io/backend',
            })
        );
    });
});