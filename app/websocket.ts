import express from '@io/lib/express'
export default express.setup(function (app) {
    app.ws('/ws', function (ws, req) {
        const tracecontext = req.tracecontext();

        ws.on('message', function (byte) {
            Promise.try(async function () {
                const text = byte.toString();
                const json = JSON.parse(text) as Message;
                json;
            }).catch(function (e: Error) {
                const errno = Number.numberify(e.errno,
                    e instanceof SyntaxError
                        ? 400
                        : 500
                );
                Object.assign(e, {
                    errno,
                });
                ws.send(JSON.stringify(<rfc7807>{
                    code: e.name,
                    type: e.help,
                    status: e.errno,
                    detail: e.message,
                    //retrydelay: e.retrydelay,
                }));
                ws.emit('error', e);
            });
        }).on('error', function (e) {
            app.emit('error', {
                name: tracecontext.traceparent(),
                type: e.errno,
                code: e.name,
                text: e.message,
                params: e.params,
            });
        }).on('close', function () {
            app.emit('event', {
                name: tracecontext.traceparent(),
                text: 'close',
            });
        });
    });
});
interface Message {
    readonly id: string
}