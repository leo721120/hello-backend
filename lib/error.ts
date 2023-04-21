export default Object.assign(Error, <ErrorConstructor>{
    build(e) {
        return Object.assign(Error(e.message), e);
    },
});
declare global {
    interface ErrorConstructor {
        build(e: Error): Error
    }
    interface Error {
        /**
        used to trace the context of error
        */
        readonly tracecontext?: CloudEvent<string>
        /**
        how long to be wait if retryable, in milliseconds
        */
        readonly retrydelay?: number
        /**
        identifies the specific occurrence of the problem.
        */
        readonly resource?: string
        /**
        the HTTP status code ([RFC7231], Section 6) generated by the origin server for this occurrence of the problem.
        */
        readonly status?: number
        /**
        more description about this error, may contain technical details
        */
        readonly reason?: unknown
        /**
        describe the params of the problem
        */
        readonly params?: object
        /**
        */
        readonly errno?: unknown
        /**
        */
        readonly code?:
        | 'ECONNREFUSED'
        | 'ENOENT'
        | string
        | number
    }
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
}