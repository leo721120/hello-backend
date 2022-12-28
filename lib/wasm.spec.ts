import wasm from '@io/lib/wasm'
//
describe('wasm', function () {
    it('.foo', async function () {
        const m = await wasm();
        expect(m.foo(1)).toBe(2);
        expect(m.foo(2)).toBe(3);
        expect(m.foo(4)).toBe(5);
    });
});