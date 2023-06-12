import protobuf from 'protobufjs'
//
describe('protobuf', function () {
    it('.load', async function () {
        const root = await protobuf.load(`${__dirname}/protobuf.test.proto`);
        const SampleMessage = root.lookupType("example.SampleMessage");
        {
            const invalid = SampleMessage.verify({ name: 'test' });
            expect(invalid).toBeFalsy();
        }
        {
            const invalid = SampleMessage.verify({ name: 13 });
            expect(invalid).toBeTruthy();
        }
        const message = SampleMessage.create({
            name: 'test',
        });
        expect(message).toEqual({
            name: 'test',
        });
        const buffer = SampleMessage.encode(message).finish();
        const decoded = SampleMessage.decode(buffer);
        expect(decoded).toEqual({
            name: 'test',
        });
    });
});