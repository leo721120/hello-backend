import express from '@io/lib/express'
import '@io/lib/event'
import '@io/lib/node'
export default express.service(function (app) {
    app.ws('/ws', function (ws, req) {
        const re = req.cloudevent();
        //
        ws.on('error', function (e) {
            app.emit('error', Object.assign(e, <typeof e>{
                cloudevent: re,
            }));
        }).on('close', function () {
            app.emit('event', CloudEvent({
                ...re,
                text: 'close',
            }));
        }).on('message', function (byte) {
            const ce = CloudEvent<'WebSocket.Message'>({
                ...re,
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
                            type: e.help,
                            code: e.name,
                            status: e.errno,
                            detail: e.message,
                        });
                    },
                    reply(message) {
                        ws.send(JSON.stringify(message), function (e) {
                            ws.emit('error', e);
                        });
                    },
                },
            });
            app.emit('event', ce);
            app.emit(ce.type, ce);
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
            reply<A>(message: A): void
        }
    }
}