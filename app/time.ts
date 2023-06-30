import express from '@io/app/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/time', function (req, res) {
        const tz = Date.timezone();
        res.status(200).json({
            now: req.now,
            name: tz.name(),
            offset: tz.offset(),
        });
    });
});