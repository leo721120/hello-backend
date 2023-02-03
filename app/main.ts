import express from '@io/lib/express'
import compress from 'compression'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import pino from 'pino'
import '@io/lib/node'
dotenv.config();
Promise.try(async function () {
    const app = express();
    const log = pino({
        level: process.env.LOG_LEVEL ?? 'info',
        base: { appid: process.env.APP_ID },
        messageKey: 'text',
    });
    app.once('close', function () {
        log.info({ text: 'close' });
    }).on('event', function (e) {
        log.info({
            name: e.id,
            type: e.type,
            source: e.source,
            status: e.status,
            elapse: e.elapse,
            at: e.time,
            text: e.text,
        });
    }).on<string>('error', function (e, a) {// bind before setup to prevent [ERR_UNHANDLED_ERROR]
        log.warn({
            name: a?.id,
            type: e.errno,
            code: e.name,
            text: e.message,
        });
    });
    {
        app.use(compress());
        app.use(helmet());
        app.use(cors());
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
    process.once('exit', function (code) {
        log.info({ exit: code });
    }).once('SIGINT', function (signal) {
        log.info({ signal });
        srv.close();
    });
}).catch(console.error);