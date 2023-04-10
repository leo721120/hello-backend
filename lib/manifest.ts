export default function () {
    return process.manifest();
}
declare global {
    namespace NodeJS {
        interface Process {
            manifest(): Readonly<{
                readonly version: string
                readonly name: string
            }>
        }
    }
}
Object.assign(process, <typeof process>{
    manifest() {
        const path = require.resolve('../package.json');
        const json = require(path) as ReturnType<typeof this.manifest>;
        this.manifest = () => json;
        return json;
    },
});