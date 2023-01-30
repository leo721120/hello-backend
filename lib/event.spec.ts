import '@io/lib/event'
//
describe('event', function () {
    it('.cloudevent, id', async function () {
        const t = new Date().toISOString();
        const c = CloudEvent({
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
            time: t,
        });
        expect(c).toEqual({
            datacontenttype: 'application/json',
            specversion: '1.0',
            id: expect.any(String),
            time: t,
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
    });
    it('.cloudevent, id', async function () {
        const t = new Date().toISOString();
        const c = CloudEvent({
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
            time: t,
            id: '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
        });
        expect(c).toEqual({
            datacontenttype: 'application/json',
            specversion: '1.0',
            id: '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
            time: t,
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
    });
    it.each([
        '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
    ])('.tracecontext', async function (text) {
        const ctx = TraceContext(text);
        expect(ctx.traceparent()).toBe(text);
    });
});