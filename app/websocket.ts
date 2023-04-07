import express from '@io/lib/express'
import '@io/lib/event'
import '@io/lib/node'
export default express.service(function (app) {
    app.ws('/ws', function (ws, req) {
        const ce = req.cloudevent();

        ws.on('error', function (e) {
            app.emit('error', Object.assign(e, <typeof e>{
                tracecontext: ce,
            }));
        }).on('close', function () {
            app.emit('event', CloudEvent({
                ...ce,
                data: undefined,
                type: 'WebSocket.Close',
            }));
        }).on('message', function (byte) {
            const ev = CloudEvent<'WebSocket.Message'>({
                ...ce,
                type: 'WebSocket.Message',
                data: <CloudEvents['WebSocket.Message']>{
                    byte() {
                        return byte as Buffer;
                    },
                    text() {
                        return this.byte().toString();
                    },
                    json() {
                        return JSON.parse(this.text());
                    },
                    error(e) {
                        return this.reply(<rfc7807>{
                            type: e.type,
                            title: e.name,
                            status: e.status ?? 500,
                            detail: e.message,
                            instance: e.instance,
                        });
                    },
                    reply(message) {
                        return new Promise(function (done, fail) {
                            ws.send(JSON.stringify(message), function (e) {
                                e ? fail(e) : done();
                            });
                        });
                    },
                },
            });
            app.emit('event', ev);
            app.emit(ev.type, ev);
        });
    }).on('WebSocket.Message', function (ce) {
        /*Promise.try(function () {
            const ev = JSON.parse(ce.data.toString()) as CloudEvent<string>;

            Object.assign(ev, <typeof ev>{
                tracecontext: ce.tracecontext,
            });



        }).catch(function (e: Error) {
            app.emit('error', {
                name: ce.tracecontext?.traceparent(),
                type: e.errno,
                code: e.name,
                text: e.message,
                params: e.params,
            });
        });*/
    });
});
declare global {
    interface CloudEvents {
        'WebSocket.Message': {
            /**
            @return payload as buffer type
            */
            byte(): Buffer
            /**
            @return payload as string type
            */
            text(): string
            /**
            @return payload as json object
            */
            json<V>(): V
            /**
            reply an error to client
            */
            error(e: Error): void
            /**
            reply a message to client
            */
            reply<A>(message: A): Promise<void>
        }
    }
}