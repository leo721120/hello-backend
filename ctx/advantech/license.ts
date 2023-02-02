import path from 'node:path'
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import '@io/lib/error'
import '@io/lib/node'
export const lib = ffi.Library(path.join(__dirname, 'AdvantechLicense'), {
    //AdvantechLicense_GenerateProductId: ['int32', ['string', 'void*', 'void*']],
    AdvantechLicense_GetLicense: ['int32', ['byte*', 'uint32', 'string', 'pointer', 'void*']],
    //AdvantechLicense_GetLicenseEx: ['int32', ['byte*', 'uint32', 'string', 'string', 'void*', 'void*']],
    //AdvantechLicense_ActivateLicenseOnline: ['int32', ['byte*', 'uint32', 'string', 'byte*', 'uint32', 'string', 'void*', 'void*']],
    //AdvantechLicense_ActivateLicenseOnlineEx: ['int32', ['byte*', 'uint32', 'string', 'byte*', 'uint32', 'string', 'string', 'void*', 'void*']],
    //AdvantechLicense_ActivateLicenseOffline: ['int32', ['byte*', 'uint32', 'string', 'byte*', 'uint32', 'void*', 'void*']],
    //AdvantechLicense_ActivateLicenseOfflineEx: ['int32', ['byte*', 'uint32', 'string', 'byte*', 'uint32', 'string', 'void*', 'void*']],
    //AdvantechLicense_DeleteLicense: ['int32', ['byte*', 'uint32', 'string', 'void*', 'void*']],
});
export const error = {
    Codes: <const>[
        'Ok',// 0
        'GenericError',// -1
        'GetSystemInfoFailed',// -2
        'EncryptFailed',// -3
        'DecryptFailed',// -4
        'ParseFailed',
        'ProductNameNotMatch',
        'MacNotMatch',
        'LicenseExpired',
        'ServerConnectFailed',
        'ServerResponseError',// -10
        'SerialUsed',// -11
    ],
    name(e: number): string {
        const index = Math.abs(e);
        return index < this.Codes.length
            ? this.Codes[index]
            : 'UnknownError'
            ;
    },
};
export const summary = {
    async extract(productName: string, payload: Buffer) {
        const result = Promise.result<LicenseSummary>();
        const callback = ffi.Callback('void', [
            'byte*', 'uint32', 'void*'
        ], function (data: Buffer, size: number, _) {
            console.log(data.type);
            const byte = data.reinterpret(size);
            result.ok(JSON.parse(byte.toString()));
        });
        const err = lib.AdvantechLicense_GetLicense(
            payload,
            payload.length,
            productName,
            callback as never,
            ref.NULL as never
        );
        if (err) throw Error.Code({
            message: 'fail to extract summary from license payload',
            name: error.name(err),
            errno: err,
        });
        return await result;
    },
};
export default {
    summary,
};
export interface ProductIdParamConfig {
    readonly mac: string
}
export interface OnlineActinveParamConfig {
    readonly licenseKey: string
    readonly mac: string
}
export interface OfflineActinveParamConfig {
    readonly licenseData: Buffer
}
export interface DeleteLicenseParamConfig {
    readonly licenseRegisterDate: Date
}
export interface LicenseSummary {
    readonly licenses: readonly License[]
    readonly summary: {
        readonly [productNO: string]: {
            readonly totalCount: number
        }
    }
}
export interface License {
    readonly licenseKey: string
    readonly description: string
    readonly mac: string
    readonly brand: string
    readonly productNO: string
    readonly count: number
    readonly trial: boolean
    readonly registerDate: string
    readonly expireDate: string
    readonly expired: boolean
}