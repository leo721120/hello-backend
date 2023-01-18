import express from '@io/lib/express'
export default express.setup(function (app) {
    app.get('/version', async function (req, res) {
        const info = await req.app.service('manifest');
        res.status(200).json({
            version: info.version,
        });
    });
});