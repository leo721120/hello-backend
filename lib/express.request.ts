import express from 'express'
import '@io/lib/event'
import '@io/lib/error'
import '@io/lib/node'
export default Object.assign(express.request, <typeof express.request>{
    cloudevent() {
        const e = CloudEvent({
            id: this.header('traceparent'),
            type: this.method.toUpperCase(),
            time: this.now.toISOString(),
            data: undefined,
            source: this.url,
        });
        this.cloudevent = () => {
            return e;
        };
        return e;
    },
    querystrings(name) {
        const values = this.query[name] as undefined | string | string[] ?? [];
        const text = [].concat(values as []).join(',');
        return text.split(',').filter(Boolean).unique();
    },
    content() {
        return this.body;
    },
    authorization() {
        const header = this.header('authorization') ?? '';
        const [type = '', credentials = ''] = header.split(' ');
        const authorization = [type.toLocaleLowerCase(), credentials] as [string, string];
        this.authorization = () => authorization;
        return authorization;
    },
    authenticate() {
        const [type] = this.authorization();
        const cb = this.app.authenticate(type) ?? function () {
            throw Error.Code({
                message: 'unknown authenticate type',
                name: 'Unauthorized',
                errno: 401,
                params: { type },
            });
        };
        return cb(this);
    },
});
declare global {
    namespace Express {
        interface Request {
            /**
            time to receive this request
            */
            readonly now: Date
            /**
            extract tracecontext from header
            */
            cloudevent(): CloudEvent<string>
            /**
            empty array if not found
            */
            querystrings<K extends string>(name: string): K[]
            /**
            return body content
            */
            content<V>(): V
            content<V>(mime: 'application/json'): V
            content<V>(mime: 'application/cloudevents+json'): V
            /**
            extract authorization header as [type, credentials]
            */
            authorization(): [string, string]
            /**
            find user object from registered authenticate functions
            */
            authenticate<U extends {}>(): Promise<U | undefined>
        }
    }
}