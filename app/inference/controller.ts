import express from '@io/lib/express'
import '@io/lib/error'
export default express.service(function (app) {
    app.post('/inference/:mid/predict', async function (req, res) {
        const tracecontext = req.tracecontext();
        const mid = req.parameter('mid');
        const reply = await app.service('inference/openapi')
            .invoke({ tracecontext })
            .predict({ mid, img: req })
            ;
        if (!reply.status) {// FIXME: status code is incorrect
            /*throw Error.build({
                message: reply.error_message,
                reason: reply.error_code,
                name: 'OperationFailed',
                status: 504,
            });*/
        }
        res.status(200).json(reply);
    });
});