import * as logstream from 'rotating-file-stream'
import path from 'node:path'
import pino from 'pino'
export default function () {
    const destination = process.env.LOG_SINK?.length
        ? path.resolve(process.env.LOG_SINK)
        : null
        ;
    return pino(
        {
            level: process.env.LOG_LEVEL ?? 'info',
            base: { appid: process.env.APP_ID },
            messageKey: 'text',
        },
        !destination?.length
            ? pino.destination()
            : logstream.createStream(destination, {
                compress: 'gzip',
                interval: '1d',
                size: '30M',
                maxFiles: 30,
            })
    );
}
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            destination of log
            */
            readonly LOG_SINK?: string | 'app.log'
            /**
            filter level

            @default info
            */
            readonly LOG_LEVEL?:
            | 'silent'
            | 'info'
        }
    }
}