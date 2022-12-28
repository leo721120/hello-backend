import fs from 'node:fs/promises'
export default async function () {
    const path = require.resolve('./wasm/main.wasm');
    const byte = await fs.readFile(path);
    const wasm = await WebAssembly.instantiate(byte);
    exports.default = async function () {
        return wasm.instance.exports;
    };
    return wasm.instance.exports as {
        foo(a: number): number
    };
}