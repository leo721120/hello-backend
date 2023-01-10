import express from 'express'
import '@io/lib/node'
export default Object.assign(express.response, <typeof express.response>{
    elapse() {
        const now = Date.now();
        const elapse = now - this.req.now.getTime();
        return elapse;
    },
    error(e) {
        if (e.retrydelay) {
            const delay = e.retrydelay / 1000;// convert to seconds
            this.set('Retry-After', delay.toString());
        }

        const errno = Number.numberify(e.errno, 500);
        this.status(errno < 0 ? 500 : errno);
        this.statusMessage = e.name;
        return this.json(<rfc7807>{
            code: e.name,
            type: e.help,
            detail: e.message,
            instance: this.req.path,
            parameters: e.params,
        });
    },
});
declare global {
    namespace Express {
        interface Response {
            /**
            how much time has elapsed since receiving the request
            */
            elapse(): number
            /**
            response an error as rfc7807
            */
            error(e: Error): this
        }
    }
}