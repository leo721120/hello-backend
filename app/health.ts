import express from '@io/lib/express'
export default express.service(function (app) {
    app.get('/health', async function (req, res) {
        const cloudevent = req.cloudevent();
        const db = req.app.service('db');
        await db.authenticate({ cloudevent });
        res.status(204).end();
    });
});