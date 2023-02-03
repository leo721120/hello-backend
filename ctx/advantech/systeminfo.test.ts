import systeminfo from '@io/ctx/advantech/systeminfo'
//
describe('advantech', function () {
    it('.systeminfo', async function () {
        const e = await systeminfo().catch<Error>(e => e);
        expect(e).toEqual(expect.objectContaining({
            message: 'fail to load system info from file',
            name: 'OperationFailed',
            reason: expect.any(String),
        }));
    });
});