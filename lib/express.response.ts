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

        this.status(e.status ?? 500);
        this.json(<rfc7807>{
            type: e.type,
            title: e.name,
            status: this.statusCode,
            detail: e.message,
            instance: e.instance ?? this.req.path,
        });
    },
    range(params) {
        const ranges = [params.start, params.end]
            .filter(Boolean)
            ;
        const range = ranges.length
            ? ranges.join('-')
            : '*'
            ;
        return this.setHeader('Content-Range',
            `${params.unit} ${range}/${params.size}`
        );
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
            /**
            format to HTTP/1.1 Content-Range header field.

            @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range
            */
            range(params: {
                readonly unit: 'items'
                readonly size: number
                readonly start?: number
                readonly end?: number
            }): this
        }
    }
}