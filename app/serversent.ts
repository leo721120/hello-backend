import express from '@io/app/express'
import '@io/lib/error'
import '@io/lib/node'
export default express.service(function (app) {
    interface Subscription {
        subscribe(stream: import('express').Response): void
        unsubscribe?(): void
    }
    const subscribes = Object.assign(new Map<string, Subscription>(), {
        maxsize: 10 as const,
    });
    app.post('/sse', async function (req, res) {
        const tracecontext = req.tracecontext();
        const user = await req.authenticate();
        const id = user.id.buffer().sha1('hex');
        await app.service('iam')
            .is(user)
            .can('read:sse')
            .in({ tracecontext })
            ;
        if (subscribes.has(id)) {// release previous
            subscribes.get(id)?.unsubscribe?.();
            subscribes.delete(id);
        }
        if (subscribes.size >= subscribes.maxsize) {// remove dead subscribes
            for (const [id, subscription] of subscribes.entries()) {
                if (!subscription.unsubscribe) {
                    subscribes.delete(id);
                }
            }
        }
        if (subscribes.size >= subscribes.maxsize) {// no more room for new subscribe
            throw Error.build({
                message: 'too many subscribes',
                status: 409,
                name: Error.Code.LimitExceeded,
                reason: {
                    maxsize: subscribes.maxsize,
                    size: subscribes.size,
                },
            });
        }
        subscribes.set(id, {
            subscribe(stream) {
                const sse = {
                    write(chunk: string) {
                        stream.write(chunk);
                    },
                    retry(ms: number) {
                        this.write(`retry: ${ms}\n`);
                    },
                    event(type: string) {
                        this.write(`event: ${type}\n`);
                    },
                    data(text: string) {
                        this.write(`data: ${text}\n\n`);
                        stream.flush?.();// for compression
                    },
                    json(data: unknown) {
                        return this.data(JSON.stringify(data));
                    },
                    end() {
                        stream.end();
                    },
                };
                const cb = function (e: CloudEvent<string>) {
                    Promise.try(async function () {
                        sse.json(e);
                    }).catch(function (e: Error) {
                        app.emit('error', e, tracecontext);
                    });
                };
                this.unsubscribe = () => {
                    this.unsubscribe = undefined;
                    subscribes.delete(id);
                    app.off('event', cb);
                    sse.event('bye');
                    sse.data('');
                    sse.end();
                    app.emit('event', {
                        ...tracecontext,
                        type: 'ServerSent.Unsubscribed',
                        source: `/sse/${id}`,
                    });
                };
                stream.once('close', () => {// if client close first
                    if (!this.unsubscribe) {
                        return;// already unsubscribed
                    }

                    this.unsubscribe = undefined;
                    //subscribes.delete(id);// keep for retry
                    app.off('event', cb);
                    app.emit('event', {
                        ...tracecontext,
                        type: 'ServerSent.LostConnection',
                        source: `/sse/${id}`,
                    });
                });
                sse.retry(3_000);
                sse.event('hello');
                sse.data('');
                app.on('event', cb);
                app.emit('event', {
                    ...tracecontext,
                    type: 'ServerSent.Subscribed',
                    source: `/sse/${id}`,
                });
            },
        });
        res.status(201).json({ id });
    }).get('/sse', function (req, res) {
        res.status(200).sendFile(`${__dirname}/serversent.html`);
    }).head('/sse/:id', function (req, res) {
        const id = req.parameter('id');

        if (!subscribes.has(id)) {
            throw Error.build({
                message: 'subscribe not found',
                status: 404,
                name: Error.Code.NotFound,
            });
        }
        res.status(200).end();
    }).get('/sse/:id', function (req, res) {
        const id = req.parameter('id');
        const subscription = subscribes.get(id);

        if (!subscription) {
            throw Error.build({
                message: 'subscribe not found',
                status: 404,
                name: Error.Code.NotFound,
            });
        } else if (!!subscription.unsubscribe) {
            throw Error.build({
                message: 'subscription already exists',
                status: 409,
                name: Error.Code.AlreadyExists,
            });
        }
        subscribes.get(id)?.subscribe(res.writeHead(200, {
            'Cache-Control': 'no-cache, no-transform',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
        }));
    }).delete('/sse/:id', function (req, res) {
        const id = req.parameter('id');
        subscribes.get(id)?.unsubscribe?.();
        subscribes.delete(id);
        res.status(204).end();
    }).authorize('read:sse', async function (user, auth) {
        //TODO:
    }).once('close', function () {// drop all subscription
        for (const [, subscription] of subscribes.entries()) {
            subscription.unsubscribe?.();
        }
    });
});
declare global {
    interface CloudEvents {
        'ServerSent.LostConnection': {
        }
        'ServerSent.Unsubscribed': {
        }
        'ServerSent.Subscribed': {
        }
    }
}