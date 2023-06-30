import express from '@io/app/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/health', async function (req, res) {
        const tracecontext = req.tracecontext();
        const db = app.service('db');
        await db.validate({ tracecontext });
        res.status(204).end();
    });
});