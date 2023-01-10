import type { Brand } from '@io/app/model'
import express from '@io/lib/express'
export default express.setup(function (app) {
    const pubsubname = process.env.EVENT_PUBSUB ?? 'pubsub';
    app.on('License.BrandAdded', function (ce) {
        Promise.try(async function () {
            const dapr = await app.service('dapr');
            await dapr.publish({
                topic: 'license',
                pubsubname,
                ...ce,
            });
        }).catch(function (e: Error) {
            app.emit('error', {
                name: ce.tracecontext?.traceparent(),
                type: e.errno,
                code: e.name,
                text: e.message,
                params: e.params,
            });
        });
    });
    app.get('/dapr/subscribe', function (req, res) {
        res.status(200).json([{
            routes: { default: '/events' },
            topic: 'events',
            pubsubname,
        }]);
    }).post(`/events`, app.express.json({
        type: 'application/cloudevents+json',
    }), function (req, res) {
        const ce = req.content<CloudEvent<string, unknown>>('application/cloudevents+json');

        if (!ce.source.includes(`/${process.env.APP_ID}`)) {// prevent loopback
            const tracecontext = req.tracecontext();
            app.emit('event', {
                name: tracecontext.traceparent(),
                source: ce.source,
                type: ce.type,
                time: ce.time,
            });
            app.emit(ce.type as never, Object.assign(ce, <typeof ce>{
                tracecontext,
            }));
        }
        res.status(200).json({ status: 'SUCCESS' });
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            name of broker to publish/subscribe event
            */
            readonly EVENT_PUBSUB?: string
        }
    }
    interface Application {
        on<K extends keyof CloudEvents>(event: K, cb: (e: CloudEvent<K, CloudEvents[K]>) => void): this
        off<K extends keyof CloudEvents>(event: K, cb: (e: CloudEvent<K, CloudEvents[K]>) => void): this
        once<K extends keyof CloudEvents>(event: K, cb: (e: CloudEvent<K, CloudEvents[K]>) => void): this
        emit<K extends keyof CloudEvents>(event: K, e: CloudEvent<K, CloudEvents[K]>): boolean
        on<A extends object>(event: 'event', cb: (e: A) => void): this
        off<A extends object>(event: 'event', cb: (e: A) => void): this
        once<A extends object>(event: 'event', cb: (e: A) => void): this
        emit<A extends object>(event: 'event', e: A): boolean
        emit<A extends object>(event: 'error', e: A): boolean
    }
    interface CloudEvents {
        'License.BrandAdded': {
            readonly id: Brand['id']
        }
        'License.BrandRemoved': {
            readonly id: Brand['id']
        }
        'License.DevicesRegistered': {
            readonly id: Brand['id']
        }
        'License.DevicesRemoved': {
            readonly id: Brand['id']
        }
        'License.LicensesApplied': {
            readonly id: Brand['id']
        }
        'License.PricingChanged': {
            readonly id: Brand['id']
        }
        'License.QuotaIsLow': {
            readonly id: Brand['id']
        }
        'License.OutOfQuota': {
            readonly id: Brand['id']
        }
        'License.QuotaRestored': {
            readonly id: Brand['id']
        }
    }
}