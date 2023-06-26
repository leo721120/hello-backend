import type { AttestationResult } from './authenticate.fido2'
import type { AssertionResult } from './authenticate.fido2'
import express from '@io/app/express'
import path from 'node:path'
import '@io/lib/node'// auto convert arraybuffer to base64 string
export default express.service(function (app) {
    app.get('/webauthn/:name/attestation', async function (req, res) {
        const name = req.parameter('name');
        const challenge = await app
            .service('fido2')
            .challenge(name, {
                origin: req.origin(),
            })
            ;
        res.status(200).json({
            ...challenge,
            timeout: 60_000,
            attestation: 'none',// we don't need trace user information
        });
    }).post('/webauthn/:name/attestation', app.express.json(), async function (req, res) {
        const result = req.content<AttestationResult>('application/json');
        const name = req.parameter('name');
        const attestation = await app
            .service('fido2')
            .attestation(name, result)
            ;
        res.status(200).json(attestation);
    }).get('/webauthn/:name/assertion', async function (req, res) {
        const name = req.parameter('name');
        const challenge = await app
            .service('fido2')
            .authenticate(name, {
                origin: req.origin(),
            })
            ;
        res.status(200).json(challenge);
    }).post('/webauthn/:name/assertion', app.express.json(), async function (req, res) {
        const result = req.content<AssertionResult>('application/json');
        const name = req.parameter('name');
        const assertion = await app
            .service('fido2')
            .assertion(name, result)
            ;
        res.status(200).json(assertion);
    }).get('/webauthn/demo', function (req, res) {
        res.format({
            html() {
                res.sendFile(path.join(__dirname, './webauthn.html'));
            },
        });
    });
});