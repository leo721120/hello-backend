import express from '@io/lib/express'
export default express.setup(function (app) {
    app.get('/health', async function (req, res) {
        //await req.app.service('mongo');
        const db = await req.app.service('db');
        await db.authenticate({
            tracecontext: req.tracecontext(),
        });
        res.status(204).end();
    });
});