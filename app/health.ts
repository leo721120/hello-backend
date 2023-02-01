import express from '@io/lib/express'
export default express.service(function (app) {
    app.get('/health', async function (req, res) {
        //await req.app.service('mongo');
        const db = await req.app.service('db');
        await db.authenticate({
            cloudevent: req.cloudevent(),
        });
        res.status(204).end();
    });
});