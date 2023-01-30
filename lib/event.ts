import { CloudEventV1 } from 'cloudevents'
import TraceParent from 'traceparent'
import '@io/lib/node'
export default Object.assign(globalThis, <typeof globalThis>{
    TraceContext(text) {
        const trace = text?.length
            ? TraceParent.fromString(text)
            : TraceParent.startOrResume(null, {
                transactionSampleRate: 1,
            })
            ;
        return <TraceContext>{
            traceparent() {
                return trace.toString();
            },
        };
    },
    CloudEvent(params) {
        return {
            datacontenttype: 'application/json',
            specversion: '1.0',
            source: '/',
            id: params.id ?? String.nanoid(32),
            time: params.time ?? new Date().toISOString(),
            ...params,
        };
    },
});
declare global {
    interface TraceContext {
        /**
        @return traceparent as string
        */
        traceparent(): string
    }
    interface CloudEvents {
        // use declare to append event
    }
    interface CloudEvent<K extends string> extends CloudEventV1<unknown> {
        readonly tracecontext?: TraceContext
        readonly datacontenttype?:
        | 'application/json'
        readonly type: K
        readonly data: K extends keyof CloudEvents
        ? CloudEvents[K]
        : unknown
    }
    var TraceContext: {
        (text: string): TraceContext
        (): TraceContext
    }
    var CloudEvent: {
        <K extends string>(params: Editable<K>): CloudEvent<K>
    }
}
type Editable<K extends string> = Partial<CloudEvent<K>> & Pick<CloudEvent<K>,
    | 'datacontenttype'
    | 'tracecontext'
    | 'type'
    | 'data'
>;