export default Object.assign(Error, <ErrorConstructor>{
    Code(e) {
        return Object.assign(Error(e.message), e);
    }
});
declare global {
    interface ErrorConstructor {
        Code(e: Error): Error
    }
    interface Error {
        /**
        how long to be wait if retryable, in milliseconds
        */
        readonly retrydelay?: number
        readonly params?: object
        readonly errno?: number | string
        /**
        indicate the direction of the user
        */
        readonly help?: string
    }
}