import express from '@io/lib/express'
export default express.service(function (app) {
    app.use('/apphub', async function (req, res) {
        const tracecontext = req.tracecontext();
        {
            tracecontext.servertiming = res.servertiming.bind(res);
        }
        const reply = await app
            .service('apphub/openapi')
            .invoke({ tracecontext })
            .login()
            ;
        res.status(200).json(reply);
    });
});