import authenticate from './authenticate'
import express from '@io/lib/express'
export default express.service(function (app) {
    app.authenticate('basic', function (req) {
        const [, credentials] = req.authorization();
        const { username, password } = authenticate.basic.decrypt(credentials);
        {
            //TODO:
        }
        return {
            username,
            password,
        };
    });
});