import os from 'node:os'
import '@io/lib/os'
//
describe('os', function () {
    it('.uuid', async function () {
        const id = await os.uuid();
        expect(id).toEqual(expect.any(String));
    });
});