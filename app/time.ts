import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
    const tz = Date.timezone();
    app.get('/time', function (req, res) {
        res.status(200).json({
            now: new Date(),
            name: tz.name(),
            offset: tz.offset(),
        });
    });
});