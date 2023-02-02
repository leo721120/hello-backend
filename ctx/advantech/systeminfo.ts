import path from 'node:path'
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import '@io/lib/error'
import '@io/lib/node'
export const lib = ffi.Library(path.join(__dirname, 'LoadSystemInfo'), {
    LoadSystemInfo_LoadFile: ['bool', ['string', 'void*', 'void*']],
});
export default async function (): Promise<SystemInfo> {
    const result = Promise.result<string>();
    const callback = ffi.Callback('void', [
        'byte*', 'uint32', 'void*',
    ], function (data: Buffer, size: number, _) {
        result.ok(data.reinterpret(size).toString());
    });
    const ok = lib.LoadSystemInfo_LoadFile(
        '/root/system-info.dat',
        callback as never,
        ref.NULL as never,
    );
    if (!ok) throw Error.Code({
        message: 'fail to load system info from file',
        name: 'OperationFailed',
        reason: await result,
    });
    const info = JSON.parse(await result) as {
        readonly docker?: SystemInfoDocker
        readonly networks?: readonly SystemInfoNetwork[]
    };
    return {
        networks: info.networks?.map(function (network) {
            return Object.pick(network,
                'name',
                'mac',
                'ip',
                'ipv6',
            );
        }),
        docker: info.docker
            ? Object.pick(info.docker,
                'container_id',
                'container_name',
                'image_id',
                'image_name',
            ) : undefined,
    };
};
export interface SystemInfoDocker {
    readonly container_id: string
    readonly container_name: string
    readonly image_id: string
    readonly image_name: string
}
export interface SystemInfoNetwork {
    readonly name: string
    readonly mac: string
    readonly ip?: readonly string[]
    readonly ipv6?: readonly string[]
}
export interface SystemInfo {
    readonly docker?: SystemInfoDocker
    readonly networks?: readonly SystemInfoNetwork[]
}