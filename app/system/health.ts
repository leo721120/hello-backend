import express from '@io/app/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/health', async function (req, res) {
        const tracecontext = req.tracecontext();
        const db = req.app.service('db');
        await db.authenticate({ tracecontext });
        res.status(204).end();
    });
});