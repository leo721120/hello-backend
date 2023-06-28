import type { ExpectedAttestationResult } from 'fido2-lib'
import type { ExpectedAssertionResult } from 'fido2-lib'
import type { Fido2AttestationResult } from 'fido2-lib'
import type { Fido2AssertionResult } from 'fido2-lib'
import type { AttestationResult } from 'fido2-lib'
import type { AssertionResult } from 'fido2-lib'
import { Fido2Lib } from 'fido2-lib'
import express from '@io/app/express'
import manifest from '@io/lib/manifest'
import '@io/lib/node'// auto convert arraybuffer to base64 string
import '@io/lib/error'
export type { AttestationResult } from 'fido2-lib'
export type { AssertionResult } from 'fido2-lib'
export default express.service(function (app) {
    app.service<Service>('fido2', function () {
        const authentications = Object.assign(new Map<string, Fido2AttestationResult>(), {
            find(key: string, e?: Partial<Error>) {
                if (!authentications.has(key)) throw Error.build({
                    message: 'authentication not found',
                    name: 'NotFound',
                    status: 401,
                    params: { key },
                    ...e,
                });
                return authentications.get(key)!;
            },
        });
        const attestations = Object.assign(new Map<string, ExpectedAttestationResult>(), {
            pop(key: string, e?: Partial<Error>) {
                if (!attestations.has(key)) throw Error.build({
                    message: 'webauthn attestation not found',
                    name: 'NotFound',
                    status: 400,
                    params: { key },
                    ...e,
                });

                const value = attestations.get(key);
                attestations.delete(key);
                return value!;
            },
        });
        const assertions = Object.assign(new Map<string, ExpectedAssertionResult>(), {
            pop(key: string, e?: Partial<Error>) {
                if (!assertions.has(key)) throw Error.build({
                    message: 'webauthn assertion not found',
                    name: 'NotFound',
                    status: 400,
                    params: { key },
                    ...e,
                });

                const value = assertions.get(key);
                assertions.delete(key);
                return value!;
            },
        });
        const f2l = new Fido2Lib({
            timeout: 60000,
            //rpId: "localhost",
            rpName: manifest.name,
            //rpIcon: "https://example.com/logo.png",
            challengeSize: 128,
            //attestation: "none",
            //cryptoParams: [-7, -257],
            //authenticatorAttachment: "platform",
            //authenticatorRequireResidentKey: false,
            //authenticatorUserVerification: "required"
        });
        function arraybufferify(base64: unknown) {
            console.assert(typeof base64 === 'string');
            const data = Buffer.from(base64 as string, 'base64');
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        }
        return {
            async challenge(name, options) {
                const displayName = name;
                const id = name.buffer().sha1('hex');
                const result = await f2l.attestationOptions({
                });
                const challenge = Buffer
                    .from(result.challenge)
                    .toString('base64')
                    ;
                attestations.set(id, {
                    origin: 'http://localhost',
                    factor: 'either',
                    ...options,
                    challenge,
                });
                return <typeof result>{
                    ...result,// auto convert arraybuffer to base64 string
                    //
                    user: {
                        displayName,
                        name,
                        id,
                    },
                    timeout: 60_000,
                    attestation: 'none',// we don't need trace user information
                };
            },
            async attestation(name, result) {
                const id = name.buffer().sha1('hex');
                const expect = attestations.pop(id);
                {
                    result.id = arraybufferify(result.id);
                    result.rawId = arraybufferify(result.rawId);
                }
                const attestation = await f2l
                    .attestationResult(result, { ...expect })
                    .catch(function (e: Error) {
                        throw Object.assign(e, <typeof e>{
                            status: 400,
                            reason: {
                                result,
                                expect,
                            },
                        });
                    });
                authentications
                    .set(id, attestation)
                    ;
                return attestation;
            },
            async authenticate(name, options) {
                const id = name.buffer().sha1('hex');
                const attestation = authentications.find(id);
                const result = await f2l.assertionOptions({
                });
                const challenge = Buffer
                    .from(result.challenge)
                    .toString('base64')
                    ;
                assertions.set(id, {
                    origin: 'http://localhost',
                    factor: 'either',
                    ...options,
                    challenge,
                    publicKey: attestation.authnrData.get('credentialPublicKeyPem') as string,
                    prevCounter: attestation.authnrData.get('counter') as number,
                    userHandle: Buffer.from(attestation.authnrData.get('credId') as ArrayBuffer).toString('base64'),
                });
                return <typeof result>{
                    ...result,
                    //
                    allowCredentials: [{
                        type: 'public-key',
                        id: attestation.authnrData.get('credId') as ArrayBuffer,
                        transports: attestation.authnrData.get('transports'),
                    }],
                };
            },
            async assertion(name, result) {
                const id = name.buffer().sha1('hex');
                const expect = assertions.pop(id);
                {
                    result.id = arraybufferify(result.id);
                    result.rawId = arraybufferify(result.rawId);
                }
                const assertion = await f2l
                    .assertionResult(result, expect)
                    .catch(function (e: Error) {
                        throw Object.assign(e, <typeof e>{
                            status: 401,
                            reason: {
                                result,
                                expect,
                            },
                        });
                    });
                return assertion;
            },
        };
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'fido2'): Service
        }
    }
}
interface Service {
    challenge(name: string, options: Partial<ExpectedAttestationResult>): Promise<object>
    attestation(name: string, result: AttestationResult): Promise<Fido2AttestationResult>
    authenticate(name: string, options: Partial<ExpectedAssertionResult>): Promise<object>
    assertion(name: string, result: AssertionResult): Promise<Fido2AssertionResult>
}