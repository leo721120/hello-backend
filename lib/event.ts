import { CloudEventV1 } from 'cloudevents'
import TraceParent from 'traceparent'
import '@io/lib/node'
export default Object.assign(globalThis, <typeof globalThis>{
    CloudEvent(params) {
        if (params.id === null) {
            return CloudEvent({
                ...params,
                id: '00-00000000000000000000000000000000-0000000000000000-00',
            });
        } else if (params.id === undefined) {
            const id = TraceParent.startOrResume(null, {
                transactionSampleRate: 1,
            });
            return CloudEvent({
                ...params,
                id: id.toString(),
            });
        } else {
            const id = TraceParent.fromString(params.id);

            return {
                datacontenttype: 'application/json',
                specversion: '1.0',
                ...params,
                id: id.toString(),
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
        <K extends string>(params: Omit<CloudEvent<K>, 'id'> & {
            readonly id:
            //
            | CloudEventV1<unknown>['id']
            // 00-00000000000000000000000000000000-0000000000000000-00
            | null
            // generate new one
            | undefined
        }): CloudEvent<K>
    }
}