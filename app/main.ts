import logstream from '@io/app/main.log'
import manifest from '@io/lib/manifest'
import express from '@io/lib/express'
import compress from 'compression'
import dotenv from 'dotenv'
import helmet from 'helmet'
import debug from 'debug'
import cors from 'cors'
import '@io/lib/node'
export default Promise.try(async function () {
    {
        dotenv.config();
    }
    const err = debug('app:main');
    const app = express();
    const log = logstream();
    {
        log.info({
            version: manifest.version,
            name: manifest.name,
        });
        app.on('event', function ({ id, type, source, time, data, specversion, datacontenttype, ...e }) {
            log.info({
                id,
                type,
                source,
                ...e,
            });
        }).on<string>('error', function (e, c) {// bind before setup to prevent [ERR_UNHANDLED_ERROR]
            log.warn({
                id: c?.id ?? '00-00000000000000000000000000000000-0000000000000000-00',
                type: e.name,
                text: e.message,
                errno: e.errno,
                params: e.params,
                reason: e.reason,
            });
            if (process.env.DEBUG) {
                err(e.stack);
            }
        }).once('close', function () {
            log.info({ text: 'close' });
        });
    }
    if (process.env.API_PREFIX) {
        app.use(process.env.API_PREFIX, function (req, res, next) {
            app.handle(req, res, next);
        });
    }
    app.use(compress());
    app.use(helmet({ contentSecurityPolicy: false }));// disable for apidoc
    app.use(cors());
    {
        await app.setup(await import('@io/app/domain'));
    }
    const srv = app.listen(process.env.APP_PORT, function () {
        app.emit('ready');
    }).once('listening', function () {
        log.info(srv.address());
    }).once('close', function () {
        app.emit('close');
    }).on('error', function (e) {
        app.emit('error', e);
    });
    process.once('SIGTERM', function (signal) {
        log.info({ signal });
        srv.close();
    }).once('SIGINT', function (signal) {
        log.info({ signal });
        srv.close();
    }).once('exit', function (code) {
        log.info({ exit: code });
    }).on('error', function (e) {
        app.emit('error', e);
    }).on('warning', function (e) {
        app.emit('error', e);
    });
    return srv;
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            readonly API_PREFIX?: string | '/api/v1'
        }
    }
}