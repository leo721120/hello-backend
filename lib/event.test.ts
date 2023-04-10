import '@io/lib/event'
//
describe('event', function () {
    it('.cloudevent, id=null', async function () {
        const t = new Date().toISOString();
        const c = CloudEvent({
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
            time: t,
            id: null
        });
        expect(c).toEqual(<typeof c>{
            id: '00-00000000000000000000000000000000-0000000000000000-00',
            time: t,
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
    });
    it('.cloudevent, id=undefined', async function () {
        const t = new Date().toISOString();
        const c = CloudEvent({
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
            time: t,
            id: undefined,// generate new one
        });
        expect(c).toEqual(<typeof c>{
            id: expect.any(String),
            time: t,
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
    });
    it('.cloudevent, id=', async function () {
        const t = new Date().toISOString();
        const c = CloudEvent({
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
            time: t,
            id: '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
        });
        expect(c).toEqual(<typeof c>{
            id: '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
            time: t,
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
    });
});