import { CloudEventV1 } from 'cloudevents'
import TraceParent from 'traceparent'
import '@io/lib/node'
//
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
    interface CloudEvent<K extends string, V extends unknown> extends CloudEventV1<V> {
        readonly tracecontext?: TraceContext
        readonly datacontenttype?:
        | 'application/json'
        readonly data: V
        readonly type: K
    }
    var TraceContext: {
        (text: string): TraceContext
        (): TraceContext
    }
    var CloudEvent: {
        <K extends keyof CloudEvents, V extends CloudEvents[K]>(params: Editable<K, V>): CloudEvent<K, V>
        <K extends string, V extends unknown>(params: Editable<K, V>): CloudEvent<K, V>
    }
}
type Editable<K extends string, V> = Partial<CloudEvent<K, V>> & Pick<CloudEvent<K, V>,
    | 'datacontenttype'
    | 'tracecontext'
    | 'type'
    | 'data'
>;
Object.assign(globalThis, <typeof globalThis>{
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
    CloudEvent(params: Editable<string, unknown>) {
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