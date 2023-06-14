import type { CloudEventV1 } from 'cloudevents'
import TraceParent from 'traceparent'
export default Object.assign(globalThis, <typeof globalThis>{
    CloudEvent({ id, ...e }: CloudEvent<string>) {
        return {
            id: TraceParent.fromString(id).toString(),
            ...e,
        };
    },
});
Object.assign(CloudEvent, <typeof CloudEvent>{
    id() {
        const id = TraceParent.startOrResume(null, {
            transactionSampleRate: 1,
        });
        return id.toString();
    },
});
declare global {
    interface CloudEvents {
        // use declare to append event
    }
    /**
    CloudEvents is a specification for describing event data in a common way.
    
    @link https://github.com/cloudevents/spec/blob/main/cloudevents/formats/json-format.md
    */
    interface CloudEvent<K extends string> extends CloudEventV1<unknown> {
        servertiming?(metric: string): void
        readonly specversion: '1.0'
        readonly datacontenttype?:
        | 'application/json'
        readonly type: K
        readonly data: K extends keyof CloudEvents
        ? CloudEvents[K]
        : unknown
    }
    var CloudEvent: {
        <K extends keyof CloudEvents>(e: CloudEvent<K>): CloudEvent<K>
        <K extends string>(e: CloudEvent<K>): CloudEvent<K>
        /**
        gererate new id
        */
        id(): string
    }
}