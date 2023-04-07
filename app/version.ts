import express from '@io/lib/express'
import os from 'node:os'
export default express.service(function (app) {
    app.get('/versions', async function (req, res) {
        res.status(200).json({
            backend: process.manifest.version,
            platform: os.platform(),
            os: os.version(),
        });
    });
});