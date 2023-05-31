import timer from 'node:timers/promises'
import crypto from 'node:crypto'
import nanoid from 'nanoid'
import v8 from 'v8'
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
    interface ArrayBuffer {
        /**
        ArrayBuffer cannot be serialized by JSON.stringify by default
        */
        toJSON?(): unknown
    }
    interface Buffer {
        sha256(encoding: 'base64' | 'hex'): string
        sha1(encoding: 'base64' | 'hex'): string
        md5(encoding: 'base64' | 'hex'): string
    }
    interface NumberConstructor {
        /**
        @returns converted number or default value if NaN
        */
        numberify(maybe: unknown, defaultvalue: number): number
    }
    interface Number {
        /**
        narrow range (min <= this <= max)
        */
        narrow(min: number, max: number): number
    }
    interface StringConstructor {
        nanoid(size: number): string
        /**
        random string with length to base58 encoding
        
        @link https://zh.wikipedia.org/zh-tw/Base58
        */
        base58(size: number): string
    }
    interface String {
        /**
        @returns convert as number or default value if NaN
        */
        numberify(defaultvalue: number): number
        /**
        @returns convert as number or NaN
        */
        numberify(): number
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
        /**
        */
        sha1(encoding: 'base64' | 'hex'): string
    }
    interface ObjectConstructor {
        /**
        deep copy
        */
        copy<V extends object>(o: V): V
        omit<V extends object, K extends keyof V>(o: V, ...a: readonly K[]): Omit<V, K>
        pick<V extends object, K extends keyof V>(o: V, ...a: readonly K[]): Pick<V, K>
    }
    interface Object {
        toJSON?<R>(): R
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
        /**
        a promise can be resolve/reject later by pass value/error to
        */
        result<T>(defaultvalue?: T): Promise<T> & {
            /**
            set promise as rejected with error
            */
            err<E extends Error>(e: E): void
            /**
            set promise as resolved with value
            */
            ok<A extends T>(a: A): void
        }
    }
    interface Promise<T> {
        /**
        Calls a defined callback function on each element of an array, and returns an array that contains the results.
        */
        map<R>(cb: (v: T extends readonly (infer E)[] ? E : T) => R): Promise<T extends readonly unknown[] ? readonly R[] : R>
        map<R>(cb: (v: T extends (infer E)[] ? E : T) => R): Promise<T extends unknown[] ? R[] : R>
        /**
        */
        filter(cb: (v: T extends readonly (infer E)[] ? E : T) => boolean): Promise<T extends readonly (infer E)[] ? readonly E[] : (T | undefined)>
        filter(cb: (v: T extends (infer E)[] ? E : T) => boolean): Promise<T extends (infer E)[] ? E[] : (T | undefined)>
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
    interface Date {
        /**
        @return result of isNaN(this.valueOf())
        */
        invalid(): boolean
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
        /**
        @return intersection of two arrays
        */
        intersection<A extends T>(a: Array<A>): Array<T>
        intersection<A extends T>(a: ReadonlyArray<A>): Array<T>
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
    base58: nanoid.customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'),
});
Object.assign(String.prototype, <String>{
    numberify(defaultvalue = NaN) {
        return Number.numberify(this, defaultvalue as number);
    },
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
    sha1(encoding) {
        return crypto
            .createHash('sha1')
            .update(this as string)
            .digest(encoding)
            ;
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
Object.assign(Promise.prototype, <Promise<unknown>>{
    async filter(cb) {
        return this.then(value => {
            return Array.isArray(value)
                ? value.filter(cb)
                : cb(value) ? value : undefined
                ;
        });
    },
    async map(cb) {
        return this.then(value => {
            return Array.isArray(value)
                ? value.map(cb as () => unknown)
                : cb(value)
                ;
        });
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
    result(defaultvalue) {
        const result = {} as PromiseSettledResult<unknown>;
        const future = Promise.defer(function () {
            if (!result.status) {
                Object.assign(result, <PromiseFulfilledResult<typeof defaultvalue>>{
                    status: 'fulfilled',
                    value: defaultvalue,
                });
            }
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                throw result.reason;
            }
        });
        return Object.assign(future, {
            err(e: Error) {
                console.assert(!result.status, 'already resolved or rejected');
                Object.assign(result, <PromiseRejectedResult>{
                    status: 'rejected',
                    reason: e,
                });
            },
            ok(v: unknown) {
                console.assert(!result.status, 'already resolved or rejected');
                Object.assign(result, <PromiseFulfilledResult<typeof v>>{
                    status: 'fulfilled',
                    value: v,
                });
            },
        });
    },
});
Object.assign(Array.prototype, <typeof Array.prototype>{
    unique() {
        return [...new Set(this)];
    },
    intersection(a) {
        return this.filter(v => a.includes(v));
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
Object.assign(Number.prototype, <typeof Number.prototype>{
    narrow(min, max) {
        console.assert(min < max, 'min must less than max');
        return Number.isNaN(this)
            ? NaN
            : Math.min(max, Math.max(min, this as number))
            ;
    },
});
Object.assign(ArrayBuffer.prototype, <ArrayBuffer>{
    toJSON() {
        return Buffer.from(this).toString('base64');
    },
});
Object.assign(Buffer.prototype, <Buffer>{
    sha256(encoding = 'hex') {
        return crypto
            .createHash('sha256')
            .update(this)
            .digest(encoding)
            ;
    },
    sha1(encoding = 'hex') {
        return crypto
            .createHash('sha1')
            .update(this)
            .digest(encoding)
            ;
    },
    md5(encoding = 'hex') {
        return crypto
            .createHash('md5')
            .update(this)
            .digest(encoding)
            ;
    },
});