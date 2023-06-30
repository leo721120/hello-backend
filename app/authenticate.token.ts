import express from '@io/app/express'
import '@io/lib/node'
import '@io/lib/json'
export default express.service(function (app) {
    app.authenticate('token', async function (req) {
        const [,] = req.authorization();
        //
        return {
            id: '',
        };
    });
});