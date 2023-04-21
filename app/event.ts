import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
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
            const ce = req.content<CloudEvent<never>>(
                'application/cloudevents+json'
            );
            res.status(200).json({
                status: status.SUCCESS,
            });
            {
                //TODO: loopback detect
            }
            Object.assign(ce, <typeof ce>{
                id: req.tracecontext().id,
            });
            app.emit('event', ce);
        }).catch(function (e: Error) {
            res.status(299).json({
                status: e.retrydelay
                    ? status.RETRY
                    : status.DROP,
            });
            app.emit('error', Object.assign(e, <typeof e>{
                tracecontext: req.tracecontext(),
            }));
        });
    }).on('event', function(e) {
        app.emit(e.type as never, e);
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
        on<K extends string>(event: 'event', cb: (e: CloudEvent<K>) => void): this
        off<K extends string>(event: 'event', cb: (e: CloudEvent<K>) => void): this
        once<K extends string>(event: 'event', cb: (e: CloudEvent<K>) => void): this
        emit<K extends string>(event: 'event', e: CloudEvent<K>): boolean
    }
}