import '@io/lib/node'
//
describe('String', function () {
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
});
describe('Array', function () {
    it('.unique', async function () {
        const a = [1, 2, 2, 3, 'a', 'b', 'a', 'c'];
        const v = a.unique();
        expect(a).toEqual([1, 2, 2, 3, 'a', 'b', 'a', 'c']);
        expect(v).toEqual([1, 2, 3, 'a', 'b', 'c']);
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