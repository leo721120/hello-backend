import express from '@io/lib/express'
import compress from 'compression'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import pino from 'pino'
import '@io/lib/event'
import '@io/lib/node'
export default Promise.try(async function () {
    {
        dotenv.config();
    }
    const app = express();
    const log = pino({
        level: process.env.LOG_LEVEL ?? 'info',
        base: { appid: process.env.APP_ID },
        messageKey: 'text',
    });
    app.on('event', function ({ id, type, source, time, data, ...e }) {
        log.info({
            id,
            type,
            source,
            ...e,
            at: time,
        });
    }).on('error', function (e) {// bind before setup to prevent [ERR_UNHANDLED_ERROR]
        const ce = e.tracecontext ?? CloudEvent({
            id: null,
        });
        log.warn({
            id: ce.id,
            type: e.name,
            text: e.message,
            errno: e.errno,
            params: e.params,
            reason: e.reason,
        });
        if (process.env.DEBUG) {
            console.error(e.stack);
        }
    }).once('close', function () {
        log.info({ text: 'close' });
    });
    {
        app.use(compress());
        app.use(helmet({ contentSecurityPolicy: false }));// disable for apidoc
        app.use(cors());
        {
            await app.setup(await import('@io/app/domain'));
        }
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
    return srv;
});