import type { CloudEventV1, CloudEventV1Attributes } from 'cloudevents'
import TraceParent from 'traceparent'
export default Object.assign(globalThis, <typeof globalThis>{
    CloudEvent({ id, ...params }: CloudEvent<string>) {
        if (id === null) {
            return {
                id: '00-00000000000000000000000000000000-0000000000000000-00',
                ...params,
            };
        } else if (id === undefined) {
            const id = TraceParent.startOrResume(null, {
                transactionSampleRate: 1,
            });
            return {
                id: id.toString(),
                ...params,
            };
        } else {
            return {
                id: TraceParent.fromString(id).toString(),
                ...params,
            };
        }
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
        <K extends keyof CloudEvents>(params: CloudEventV1Attributes<unknown> & {
            readonly id:
            //
            | CloudEvent<K>['id']
            // 00-00000000000000000000000000000000-0000000000000000-00
            | null
            // generate new one
            | undefined

            readonly type: K
            readonly data: K extends keyof CloudEvents
            ? CloudEvents[K]
            : unknown
        }): CloudEvent<K>
        <K extends string>(params: CloudEventV1Attributes<unknown> & {
            readonly id:
            //
            | CloudEvent<K>['id']
            // 00-00000000000000000000000000000000-0000000000000000-00
            | null
            // generate new one
            | undefined
        }): CloudEvent<K>
    }
}