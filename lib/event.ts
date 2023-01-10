import { CloudEventV1 } from 'cloudevents'
import TraceParent from 'traceparent'
import '@io/lib/node'
export function TraceContext(): TraceContext
export function TraceContext(text: string): TraceContext
export function TraceContext(text?: string): TraceContext {
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
}
/**
generate cloudevent object
*/
export function CloudEvent<K extends string, V extends unknown>(params: Editable<K, V>): CloudEvent<K, V>;
export function CloudEvent<K extends keyof CloudEvents>(params: Editable<K, CloudEvents[K]>): CloudEvent<K, CloudEvents[K]>;
export function CloudEvent<K extends keyof CloudEvents>(params: Editable<K, CloudEvents[K]>): CloudEvent<K, CloudEvents[K]> {
    return {
        datacontenttype: 'application/json',
        specversion: '1.0',
        source: '/',
        id: params.id ?? String.nanoid(32),
        time: params.time ?? new Date().toISOString(),
        ...params,
    };
}
export default {
    TraceContext,
    CloudEvent,
};
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
}
type Editable<K extends string, V> = Partial<CloudEvent<K, V>> & Pick<CloudEvent<K, V>,
    | 'datacontenttype'
    | 'tracecontext'
    | 'type'
    | 'data'
>;