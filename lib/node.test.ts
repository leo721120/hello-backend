import '@io/lib/node'
//
describe('String', function () {
    it('.numberify', async function () {
        expect('129'.numberify()).toBe(129);
    });
    it('.numberify, default value if NaN', async function () {
        expect('a'.numberify(13)).toBe(13);
    });
    it('.numberify, undefined if NaN', async function () {
        expect('a'.numberify() ?? 13).toBe(13);
    });
    it('.nanoid', async function () {
        const id = String.nanoid(8);
        expect(id.length).toBe(8);
    });
    it('.encode', async function () {
        const id = String.nanoid(8);
        expect(id.encode('base64').encode('utf8', 'base64')).toBe(id);
        expect(id.encode('base64').decode('base64')).toBe(id);
    });
    it('.base64', async function () {
        const id = String.nanoid(8);
        expect(id.base64()).toBe(Buffer.from(id).toString('base64'));
        expect(id.base64()).toBe(id.encode('base64'));
        expect(id.base64().decode('base64')).toBe(id);
    });
    it('.sha1', async function () {
        const s = 'abc012';
        expect(s.sha1('hex')).toBe('b5e0438b897040e4333ec5050b5204a9df4e9fea');
        expect(s.sha1('base64')).toBe('teBDi4lwQOQzPsUFC1IEqd9On+o=');
    });
    it('.base58', async function () {
        const id = String.base58(16);
        expect(id.length).toBe(16);
    });
});
describe('Object', function () {
    it('.copy', async function () {
        const o = {
            txt: 'abc',
            num: 123,
            arr: [1],
            obj: { a: 13 },
        };
        const c = Object.copy(o);
        o.num = 789;
        o.arr.push(2);
        expect(o).toEqual({
            txt: 'abc',
            num: 789,
            arr: [1, 2],
            obj: { a: 13 },
        });
        expect(c).toEqual({
            txt: 'abc',
            num: 123,
            arr: [1],
            obj: { a: 13 },
        });
    });
    it('.omit', async function () {
        const o = {
            txt: 'abc',
            num: 123,
            arr: [1],
            obj: { a: 13 },
        };
        const a = Object.omit(o, 'txt', 'arr');
        expect(a).toEqual({
            num: 123,
            obj: { a: 13 },
        });
        expect(o).toEqual({
            txt: 'abc',
            num: 123,
            arr: [1],
            obj: { a: 13 },
        });
    });
    it('.pick', async function () {
        const o = {
            txt: 'abc',
            num: 123,
            arr: [1],
            obj: { a: 13 },
        };
        const a = Object.pick(o, 'txt', 'arr');
        expect(a).toEqual({
            txt: 'abc',
            arr: [1],
        });
        expect(o).toEqual({
            txt: 'abc',
            num: 123,
            arr: [1],
            obj: { a: 13 },
        });
    });
});
describe('Promise', function () {
    it('.try', async function () {
        const a = await Promise.try(async function () {
            return 20;
        });
        expect(a).toBe(20);
    });
    it('.try', async function () {
        const a = [] as number[];
        const j = Promise.try(async function () {
            a.push(1);
        });
        expect(a.length).toBe(0);
        await Promise.sleep(100);
        expect(a.length).toBe(1);
        await j;
        expect(a.length).toBe(1);
    });
    it('.defer', async function () {
        const a = await Promise.defer(async function () {
            return 20;
        });
        expect(a).toBe(20);
    });
    it('.defer, not execute if never await', async function () {
        const a = [] as number[];
        const j = Promise.defer(async function () {
            a.push(1);
        });
        expect(a.length).toBe(0);
        await Promise.sleep(100);
        expect(a.length).toBe(0);
        await j;
        expect(a.length).toBe(1);
    });
    it('.timeout', async function () {
        const now = Date.now();
        const delay = 300;
        const a = await Promise.timeout(delay, function () {
            return 13;
        });
        expect(Date.now() - now - delay).toBeLessThan(20);
        expect(a).toBe(13);
    });
    it('.timeout, abort', async function () {
        const delay = 1_000;
        const array = [];
        const j = Promise.timeout(delay, () => array.push(1));
        j.abort();
        await expect(j).rejects.toThrow('The operation was aborted');
        expect(array.length).toBe(0);
    });
    it('.result', async function () {
        const r = Promise.result(1);
        expect(await r).toBe(1);
    });
    it('.result', async function () {
        const r = Promise.result(1);
        r.ok(3);
        expect(await r).toBe(3);
    });
    it('.map, value', async function () {
        const r = Promise.resolve(13);
        const v = r.map(function (a) {
            return `str_${a}`;
        });
        expect(await v).toBe('str_13');
    });
    it('.map, array', async function () {
        const r = Promise.resolve([24]);
        const v = r.map(function (a) {
            return `str_${a}`;
        });
        expect(await v).toEqual([
            'str_24'
        ]);
    });
    it('.filter, value', async function () {
        const r = Promise.resolve(13);
        const v = r.filter(function (a) {
            return a < 10;
        });
        expect(await v).toBe(undefined);
    });
    it('.filter, array', async function () {
        const r = Promise.resolve([24, 9]);
        const v = r.filter(function (a) {
            return a > 10;
        });
        expect(await v).toEqual([
            24
        ]);
    });
});
describe('Array', function () {
    it('.unique', async function () {
        const a = [1, 2, 2, 3, 'a', 'b', 'a', 'c'];
        const v = a.unique();
        expect(a).toEqual([1, 2, 2, 3, 'a', 'b', 'a', 'c']);
        expect(v).toEqual([1, 2, 3, 'a', 'b', 'c']);
    });
    it('.intersection', async function () {
        const a = [1, 4, 687, 43, 'ab'];
        const b = [1, 43, 89, 'ab'];
        expect(a.intersection(b)).toEqual([
            1, 43, 'ab',
        ]);
    });
    it('.intersection, readonly', async function () {
        const a = [1, 4, 687, 43, 'ab'];
        const b = [1, 43, 89, 'ab'] as const;
        expect(a.intersection(b)).toEqual([
            1, 43, 'ab',
        ]);
    });
});
describe('Date', function () {
    it('iso8601', async function () {
        const datetime = new Date('2022-08-25T13:01:05Z');
        expect(datetime.toISOString()).toBe('2022-08-25T13:01:05.000Z');
        expect(datetime.toJSON()).toBe('2022-08-25T13:01:05.000Z');
    });
    it('iso8601, +timezone', async function () {
        const datetime = new Date('2022-08-25T13:01:05+05:30');
        expect(datetime.toISOString()).toBe('2022-08-25T07:31:05.000Z');
        expect(datetime.toJSON()).toBe('2022-08-25T07:31:05.000Z');
    });
    it.each([
        'ZABC',
        '20220808',
        '2022-08-25T13:01:05ZABC',
    ])('iso8601, invalid, %s', async function (text) {
        const datetime = new Date(text);
        expect(datetime.invalid()).toBe(true);
    });
    it('.timezone', async function () {
        const tz = Date.timezone();
        expect(tz.name()).toBe(Intl.DateTimeFormat('en-us').resolvedOptions().timeZone);
        expect(tz.offset()).toBe(new Date().getTimezoneOffset());
    });
});
describe('Function', function () {
    it('.monkeypatch', async function () {
        const o = {
            a: 1,
            fn() {
                return this.a;
            },
        };
        const f = Function.monkeypatch(o.fn, function (fn) {
            return function () {
                return fn.call(o) + 3;
            };
        });
        expect(f()).toBe(1 + 3);
    });
});
describe('Number', function () {
    it('.numberify', async function () {
        expect(Number.numberify('a')).toBeUndefined();
        expect(Number.numberify('13')).toBe(13);
    });
    it('.narrow', async function () {
        const n = 13;
        expect(n.narrow(0, 15)).toBe(13);
        expect(n.narrow(0, 10)).toBe(10);
        expect(n.narrow(0, 13)).toBe(13);
        expect(n.narrow(18, 99)).toBe(18);
    });
    it('.narrow, NaN', async function () {
        const n = NaN;
        expect(n.narrow(-13, 15)).toBeNaN();
    });
});
describe('ArrayBuffer', function () {
    it('.toJSON', async function () {
        const a = new ArrayBuffer(16);
        const j = { a };
        const v = new Uint8Array(a);
        for (let i = 0; i < v.length; i++) {
            v[i] = i + 48;
        }
        expect(JSON.stringify(j)).toBe(JSON.stringify({
            a: 'MDEyMzQ1Njc4OTo7PD0+Pw==',// base64 of '0123456789:;<=>?'
        }));
        expect(JSON.stringify(j)).toBe(JSON.stringify({
            a: '0123456789:;<=>?'.base64(),
        }));
    });
});
describe('Buffer', function () {
    it('.md5', async function () {
        const b = Buffer.from('abc123');
        expect(b.md5('hex')).toBe('e99a18c428cb38d5f260853678922e03');
        expect(b.md5('base64')).toBe('6ZoYxCjLONXyYIU2eJIuAw==');
    });
    it('.sha1', async function () {
        const b = Buffer.from('abc123');
        expect(b.sha1('hex')).toBe('6367c48dd193d56ea7b0baad25b19455e529f5ee');
        expect(b.sha1('base64')).toBe('Y2fEjdGT1W6nsLqtJbGUVeUp9e4=');
    });
    it('.sha256', async function () {
        const b = Buffer.from('abc123');
        expect(b.sha256('hex')).toBe('6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090');
        expect(b.sha256('base64')).toBe('bKE9UspwyIPg8LsQHkJaiehiTeUdstI5JZOvaoQRgJA=');
    });
    it('.read', async function () {
        const { Readable } = await import('node:stream');
        const stream = Readable.from(Buffer.from('abc123'));
        const b = await Buffer.read(stream);
        expect(b).toBeInstanceOf(Buffer);
        expect(b.toString()).toBe('abc123');
    });
});