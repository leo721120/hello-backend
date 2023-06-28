import manifest from '@io/lib/manifest'
import express from '@io/app/express'
import os from 'node:os'
export default express.service(function (app) {
    app.get('/versions', function (req, res) {
        res.status(200).json({
            backend: manifest.version,
            hostname: os.hostname(),
            platform: os.platform(),
            os: os.version(),
        });
    });
});