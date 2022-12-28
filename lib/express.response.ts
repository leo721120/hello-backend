import express from 'express'
import '@io/lib/node'
export default Object.assign(express.response, <typeof express.response>{
    elapse() {
        const now = Date.now();
        const elapse = now - this.req.now.getTime();
        return elapse;
    },
    error(e) {
        interface rfc7807 {
            /**
            a URI reference [RFC3986] that identifies the problem type.
            */
            readonly type?: string
            /**
            a short, human-readable summary of the problem type.
            */
            readonly title?: string
            /**
            the HTTP status code ([RFC7231], Section 6) generated by the origin server for this occurrence of the problem.
            */
            readonly status?: number
            /**
            a human-readable explanation specific to this occurrence of the problem.
            */
            readonly detail?: string
            /**
            a URI reference that identifies the specific occurrence of the problem.
            */
            readonly instance?: string
            /**
            extend the problem details object with additional members.
            */
            readonly [extensions: string]: unknown
        }
        if (e.retrydelay) {
            const delay = e.retrydelay / 1000;// convert to seconds
            this.set('Retry-After', delay.toString());
        }

        const errno = Number.numberify(e.errno, 500);
        this.status(errno < 0 ? 500 : errno);
        this.statusMessage = e.name;
        return this.json(<rfc7807>{
            code: e.name,
            //type: 'none',
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