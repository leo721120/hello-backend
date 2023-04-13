const path = require.resolve('../package.json');
const json = require(path) as {
    readonly version: string
    readonly name: string
    /**
    private values from compiler time
    */
    readonly env?: typeof process.env
};
Object.assign(process.env, {
    ...json.env,
});
export default {
    ...json,
};