import express from '@io/lib/express'
export default express.setup(function (app) {
    app.all('/echo', function (req, res) {
        res.status(200).json({
            method: req.method,
            path: req.path,
            query: req.query,
            header: req.headers,
        });
    }).all('/echo/*', function (req, res) {
        res.status(200).json({
            method: req.method,
            path: req.path,
            query: req.query,
            header: req.headers,
        });
    });
});