import type { AttestationResult, ExpectedAttestationResult } from 'fido2-lib'
import type { AssertionResult, ExpectedAssertionResult } from 'fido2-lib'
import type { Fido2AttestationResult } from 'fido2-lib'
import { Fido2Lib } from 'fido2-lib'
import manifest from '@io/lib/manifest'
import express from '@io/lib/express'
import path from 'node:path'
import '@io/lib/node'// auto convert arraybuffer to base64 string
export default express.service(function (app) {
    function arraybufferify(base64: unknown) {
        console.assert(typeof base64 === 'string');
        const data = Buffer.from(base64 as string, 'base64');
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    }
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
    app.post('/webauthn/:name/attestation', app.express.json(), async function (req, res) {
        const result = req.content<AttestationResult>('application/json');
        const name = req.parameter('name');
        const id = name.sha1();
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
        res.status(200).json(attestation);
    }).get('/webauthn/:name/attestation', async function (req, res) {
        const name = req.parameter('name');
        const id = name.sha1();
        const displayName = req.querystring('displayName')
            ?? name
            ;
        const options = await f2l.attestationOptions({
        });
        const challenge = Buffer
            .from(options.challenge)
            .toString('base64')
            ;
        attestations.set(id, {
            challenge,
            origin: req.origin(),
            factor: 'either',
        });
        res.status(200).json(<typeof options>{
            ...options,// auto convert arraybuffer to base64 string
            //
            user: {
                displayName,
                name,
                id,
            },
            timeout: 60_000,
            attestation: 'none',// we don't need trace user information
        });
    }).post('/webauthn/:name/assertion', app.express.json(), async function (req, res) {
        const result = req.content<AssertionResult>('application/json');
        const name = req.parameter('name');
        const id = name.sha1();
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
        res.status(200).json({
            ...assertion,
        });
    }).get('/webauthn/:name/assertion', async function (req, res) {
        const name = req.parameter('name');
        const id = name.sha1();
        const attestation = authentications.find(id);
        const options = await f2l.assertionOptions({
        });
        const challenge = Buffer
            .from(options.challenge)
            .toString('base64')
            ;
        assertions.set(id, {
            challenge,
            origin: req.origin(),
            factor: 'either',
            publicKey: attestation.authnrData.get('credentialPublicKeyPem') as string,
            prevCounter: attestation.authnrData.get('counter') as number,
            userHandle: Buffer.from(attestation.authnrData.get('credId') as ArrayBuffer).toString('base64'),
        });
        res.status(200).json(<typeof options>{
            ...options,
            //
            allowCredentials: [{
                type: 'public-key',
                id: attestation.authnrData.get('credId') as ArrayBuffer,
                transports: attestation.authnrData.get('transports'),
            }],
        });
    }).get('/webauthn/demo', function (req, res) {
        res.format({
            html() {
                res.sendFile(path.join(__dirname, './webauthn.html'));
            },
        });
    });
});