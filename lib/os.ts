import os from 'node:os'
//
declare module 'os' {
    /**
    unique id of the machine
    */
    function uuid(): Promise<string>
}
try {
    require(`./os.${os.platform()}`);
} catch (e) {
    Object.assign(os, <typeof os>{// fallback
        async uuid() {
            return '00000000-0000-0000-0000-000000000000';
        },
    });
    process.emitWarning(e as Error);
}