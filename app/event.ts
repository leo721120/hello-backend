import express from '@io/lib/express'
import '@io/lib/node'
export default express.setup(function (app) {
    const pubsubname = process.env.EVENT_PUBSUB ?? 'pubsub';
    const enum status {// https://docs.dapr.io/reference/api/pubsub_api/#expected-http-response
        /**
        Message is processed successfully
        */
        SUCCESS = 'SUCCESS',
        /**
        Message to be retried by Dapr
        */
        RETRY = 'RETRY',
        /**
        Warning is logged and message is dropped
        */
        DROP = 'DROP',
    };
    app.get('/dapr/subscribe', function (req, res) {
        res.status(200).json([{
            routes: { default: '/events' },
            topic: 'events',
            pubsubname,
        }]);
    }).post(`/events`, app.express.json({
        type: [
            'application/cloudevents+json',
            'application/json',
        ],
    }), function (req, res) {
        Promise.try(function () {
            const tracecontext = req.tracecontext();
            const ce = req.content<CloudEvent<never>>(
                'application/cloudevents+json'
            );
            res.status(200).json({
                status: status.SUCCESS,
            });
            {
                //TODO: loopback detect
            }
            req.app.emit('event', {
                name: tracecontext.traceparent(),
                source: ce.source,
                type: ce.type,
                time: ce.time,
            });
            req.app.emit(ce.type, Object.assign(ce, <typeof ce>{
                tracecontext,
            }));
        }).catch(function (e: Error) {
            res.status(299).json({
                status: e.retrydelay
                    ? status.RETRY
                    : status.DROP,
            });
            req.app.emit('error', {
                name: req.tracecontext().traceparent(),
                type: e.errno,
                code: e.name,
                text: e.message,
                params: e.params,
            });
        });
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            name of broker to publish/subscribe event
            
            @default pubsub
            */
            readonly EVENT_PUBSUB?: string
        }
    }
    interface Application {
        on<K extends keyof CloudEvents>(event: K, cb: (e: CloudEvent<K>) => void): this
        off<K extends keyof CloudEvents>(event: K, cb: (e: CloudEvent<K>) => void): this
        once<K extends keyof CloudEvents>(event: K, cb: (e: CloudEvent<K>) => void): this
        emit<K extends keyof CloudEvents>(event: K, e: CloudEvent<K>): boolean
        on<A extends object>(event: 'event', cb: (e: A) => void): this
        off<A extends object>(event: 'event', cb: (e: A) => void): this
        once<A extends object>(event: 'event', cb: (e: A) => void): this
        emit<A extends object>(event: 'event', e: A): boolean
        emit<A extends object>(event: 'error', e: A): boolean
    }
}