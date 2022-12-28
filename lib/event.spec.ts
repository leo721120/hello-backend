import { TraceContext, CloudEvent } from '@io/lib/event'
//
describe('event', function () {
    it('.cloudevent', async function () {
        const c = CloudEvent({
            source: '/testonly',
            type: 'testonly/event',
            data: { foo: 'bar' },
        });
        expect(c).toEqual({
            datacontenttype: 'application/json',
            specversion: '1.0',
            id: expect.any(String),
            time: expect.any(String),
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