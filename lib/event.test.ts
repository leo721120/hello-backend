import '@io/lib/event'
//
describe('event', function () {
    it.each([
        '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
        '00-00000000000000000000000000000000-0000000000000000-00',
        CloudEvent.id(),
    ])('.cloudevent, id=%s', async function (id) {
        const t = new Date().toISOString();
        const c = CloudEvent({
            specversion: '1.0',
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
            time: t,
            id,
        });
        expect(c).toEqual(<typeof c>{
            specversion: '1.0',
            id,
            time: t,
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
    });
});