import * as timer from 'node:timers/promises'
import * as crypto from 'node:crypto'
import * as nanoid from 'nanoid'
import * as v8 from 'v8'
//
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            readonly NODE_ENV?:
            | 'production'
            | 'test'
        }
    }
    interface FunctionConstructor {
        monkeypatch<F extends Function>(fn: F, cb: (fn: F) => F): F
    }
    interface BufferConstructor {
        random(size: number): Buffer
    }
    interface NumberConstructor {
        /**
        @returns converted number or default value if NaN
        */
        numberify(maybe: unknown, defaultvalue: number): number;
    }
    interface StringConstructor {
        nanoid(size: number): string
    }
    interface ObjectConstructor {
        copy<V extends object>(o: V): V
        omit<V extends object, K extends keyof V>(o: V, ...a: readonly K[]): Pick<V, K>
        pick<V extends object, K extends keyof V>(o: V, ...a: readonly K[]): Omit<V, K>
    }
    interface PromiseConstructor {
        /**
        deferred execution promise
        */
        defer<R>(cb: () => R | PromiseLike<R>): Promise<R>
        /**
        create new promise just like Promise.resolve().then(done)
        */
        try<R>(cb: () => R | PromiseLike<R>): Promise<R>
        /**
        */
        timeout<R>(ms: number, cb: () => R | PromiseLike<R>): Promise<R> & AbortController
        /**
        */
        sleep(ms: number): Promise<void> & AbortController
    }
    interface DateConstructor {
        timezone(): {
            /**
            IANA timezone name
            */
            name(): string
            /**
            in minutes
            */
            offset(): number
        }
    }
    interface Object {
        toJSON?<R>(): R
    }
    interface String {
        /**
        convert to buffer

        @param encoding default to utf8
        */
        buffer(encoding?: BufferEncoding): Buffer
        /**
        convert encoding to

        @param to default to utf8
        */
        decode(from: BufferEncoding, to?: BufferEncoding): string
        /**
        convert encoding to

        @param from default to utf8
        */
        encode(to: BufferEncoding, from?: BufferEncoding): string
        /**
        convert encoding to base64
        @param from default to utf8
        */
        base64(from?: BufferEncoding): string
    }
    interface Array<T> {
        /**
        force convert element type to V
        */
        forEach<V extends T>(callbackfn: (value: V, index: number, array: T[]) => void, thisArg?: any): void;
        /**
        remove duplicated elements
        */
        unique<R extends T>(): Array<R>
    }
    interface Date {
        /**
        @return result of isNaN(this.valueOf())
        */
        invalid(): boolean
    }
    interface Dict<T> {
        readonly [name: string]: T
    }
}
Object.assign(Function, <FunctionConstructor>{
    monkeypatch(fn, cb) {
        return cb(fn);
    },
});
Object.assign(Buffer, <BufferConstructor>{
    random(size) {
        return crypto.randomBytes(size);
    }
});
Object.assign(Number, <NumberConstructor>{
    numberify(maybe, defaultvalue) {
        const v = Number(maybe);
        return Number.isNaN(v)
            ? defaultvalue
            : v
            ;
    }
});
Object.assign(String, <StringConstructor>{
    nanoid: nanoid.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'),
});
Object.assign(String.prototype, <String>{
    buffer(encoding) {
        return Buffer.from(this, encoding);
    },
    decode(from, to = 'utf8') {
        return this.buffer(from).toString(to);
    },
    encode(to, from = 'utf8') {
        return this.buffer(from).toString(to);
    },
    base64(from) {
        return this.encode('base64', from);
    },
});
Object.assign(Object, <ObjectConstructor>{
    copy(o) {// replace with <structuredClone> when node.js >= 17.x
        return v8.deserialize(v8.serialize(o));
    },
    omit(o, k, ...a) {
        const { [k]: u, ...c } = o;
        return a.length === 0
            ? c
            : this.omit(c as typeof o, ...a)
            ;
    },
    pick(o, ...k: []) {
        const c = {} as typeof o;

        for (const a of k) {
            c[a] = o[a];
        }
        return c;
    },
});
Object.assign(Promise, <PromiseConstructor>{
    timeout(ms, cb) {
        const ac = new AbortController();
        const p = timer.setTimeout(ms, Promise.defer(cb), {
            signal: ac.signal,
        }).catch(function (e: Error) {// must catch here to prevent throw out of application
            throw e;
        });
        return Object.assign(p, <AbortController>{
            signal: ac.signal,
            //
            abort() {
                if (!ac.signal.aborted) {
                    ac.abort();
                }
            },
        });
    },
    sleep(ms) {
        return Promise.timeout(ms, function () {
        });
    },
    defer(cb) {
        const lazy = Object.create(Promise.prototype) as Promise<unknown> & {
            value?: Promise<unknown>
        };
        return Object.assign(lazy, <typeof lazy>{
            then(done, fail) {
                this.value ??= Promise.try(cb);
                return this.value.then(done, fail);
            },
        });
    },
    try(cb) {
        return Promise.resolve().then(cb);
    },
});
Object.assign(Array.prototype, <typeof Array.prototype>{
    unique() {
        return [...new Set(this)];
    },
});
Object.assign(Date, <DateConstructor>{
    timezone() {
        return {
            name() {
                return Intl.DateTimeFormat('en-us').resolvedOptions().timeZone;
            },
            offset() {
                return new Date().getTimezoneOffset();
            },
        };
    },
});
Object.assign(Date.prototype, <typeof Date.prototype>{
    invalid() {
        return isNaN(this.valueOf());
    },
});