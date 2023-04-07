import express from 'express'
import '@io/lib/error'
import '@io/lib/node'
export const handle = express.application.handle;
export default Object.assign(express.application, <Application>{
    express,
    //
    service(name, factory) {
        const key = `service/${name}`;
        const get = () => {
            const f = this.get(key) as typeof factory;
            console.assert(f, `${name} factory is not found`);
            return f();
        };
        const set = () => {
            return this.set(key, () => {
                const v = factory();
                this.set(key, () => v);
                return v;
            });
        };
        return arguments.length > 1
            ? set()
            : get()
            ;
    },
    setup(object) {
        return object.default(this);
    },
    authenticate(type, cb) {
        const key = `authenticate-${type}`;
        const get = () => {
            return this.get(key);
        };
        const set = () => {
            return this.set(key, cb);
        };
        return arguments.length === 1
            ? get()
            : set()
            ;
    },
    handle(req, res, next) {
        const done = (err?: Error) => {
            const e = err ?? Error.$({
                message: `method not found`,
                name: SyntaxError.name,
                status: 400,
            });
            this.final(e, req, res, next);
        };
        Object.assign(req, <typeof req>{
            now: new Date(),
        });
        return handle.call(this, req, res, next ?? done);
    },
    final(err: Error, req, res, next) {
        Object.assign(err, <typeof err>{
            tracecontext: req.cloudevent(),
        });
        res.error(err);
        this.emit('error', err);
    },
});
declare global {
    namespace Express {
        interface Application {
            readonly express: typeof express
            readonly handle: express.RequestHandler
            readonly final: express.ErrorRequestHandler
            service<V>(name: string, factory: () => V): this
            service<V>(name: string): V
            setup<V>(object: { default: Setup<V> }): Promise<V>
            authenticate<U extends {}>(type: string, cb: Authenticate<U>): this
            authenticate<U extends {}>(type: string): Authenticate<U> | undefined
        }
    }
    interface Application extends Express.Application, ReturnType<typeof express> {
        on<A extends unknown>(event: string, cb: (...a: A[]) => void): this
        //
        on(event: 'error', cb: (e: Error) => void): this
        off(event: 'error', cb: (e: Error) => void): this
        once(event: 'error', cb: (e: Error) => void): this
        emit(event: 'error', e: Error): boolean
        on(event: 'close', cb: () => void): this
        off(event: 'close', cb: () => void): this
        once(event: 'close', cb: () => void): this
        emit(event: 'close'): boolean
    }
}
interface Setup<V> {
    (app: Application): PromiseLike<V> | V
}
interface Authenticate<U extends {}> {
    (req: express.Request): PromiseLike<U | undefined> | U | undefined
}