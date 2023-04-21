import express from '@io/lib/express'
export default express.service(function (app) {
    app.get('/health', async function (req, res) {
        const tracecontext = req.tracecontext();
        const db = req.app.service('db');
        await db.authenticate({ tracecontext });
        res.status(204).end();
    });
});