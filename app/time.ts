import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/time', async function (req, res) {
        const tz = Date.timezone();

        res.status(200).json({
            now: new Date(),
            name: tz.name(),
            offset: tz.offset(),
        });
    });
});