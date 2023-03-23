import express from 'express'
import '@io/lib/node'
export default Object.assign(express.response, <typeof express.response>{
    robotstag(value) {
        return this.setHeader('X-Robots-Tag', value);
    },
    elapse() {
        return Date.now() - this.req.now.getTime();
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
            type: e.help,
            title: e.name,
            status: this.statusCode,
            detail: e.message,
            instance: this.req.path,
        });
    },
});
declare global {
    namespace Express {
        interface Response {
            /**
            https://developers.google.com/search/docs/advanced/robots/robots_meta_tag?hl=zh-tw#xrobotstag
            */
            robotstag(value: 'noindex' | 'none'): this
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