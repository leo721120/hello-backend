import express from '@io/lib/express'
import dotenv from 'dotenv'
import pino from 'pino'
import '@io/lib/node'
dotenv.config();
Promise.try(async function () {
    const log = pino({
        level: process.env.LOG_LEVEL ?? 'info',
        base: { appid: process.env.APP_ID },
        messageKey: 'text',
    });
    const app = express();
    {
        await app.setup(await import('@io/app/domain'));
    }
    const srv = app.listen(process.env.APP_PORT, function () {
        //
    }).once('listening', function () {
        log.info(srv.address());
    }).once('close', function () {
        app.emit('close');
    }).on('error', function (e) {
        app.emit('error', e);
    });
    app.once('close', function () {
        log.info({ text: 'close' });
    }).on('error', function (e) {
        log.warn(e);
    }).on('event', function (o) {
        log.info(o);
    });
    process.once('exit', function (code) {
        log.info({ exit: code });
    }).once('SIGINT', function (signal) {
        log.info({ signal });
        srv.close();
    });
}).catch(console.error);