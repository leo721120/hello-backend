import { CloudEventV1 } from 'cloudevents'
import TraceParent from 'traceparent'
import '@io/lib/node'
export default Object.assign(globalThis, <typeof globalThis>{
    CloudEvent(params) {
        const tracecontext = params.id?.length
            ? TraceParent.fromString(params.id)
            : TraceParent.startOrResume(params.id, {
                transactionSampleRate: 1,
            })
            ;
        return {
            time: params.time ?? new Date().toISOString(),
            datacontenttype: 'application/json',
            specversion: '1.0',
            source: '.',
            ...params,
            id: tracecontext.toString(),
        };
    },
});
declare global {
    interface CloudEvents {
        // use declare to append event
    }
    interface CloudEvent<K extends string> extends CloudEventV1<unknown> {
        readonly datacontenttype?:
        | 'application/json'
        readonly type: K
        readonly data: K extends keyof CloudEvents
        ? CloudEvents[K]
        : unknown
    }
    var CloudEvent: {
        <K extends string>(params: Editable<K>): CloudEvent<K>
        readonly EMPTY_ID: string
    }
}
type Editable<K extends string> = Partial<CloudEvent<K>> & Pick<CloudEvent<K>,
    | 'type'
    | 'data'
>;
Object.assign(CloudEvent, <typeof CloudEvent>{
    EMPTY_ID: '00-00000000000000000000000000000000-0000000000000000-00',
});