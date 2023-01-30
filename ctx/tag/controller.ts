import type { Tag } from '@io/ctx/tag/model'
import express from '@io/lib/express'
export default express.setup(function (app) {
    app.use('/tags', async function (req, res, next) {
        //await req.authenticate();
        //req.authorize();
        next();
    }).get('/tags', async function (req, res) {
        const cloudevent = req.cloudevent();
        const fields = req.querystrings<keyof Tag>('field');
        const service = await app.service('tag');
        const list = await service
            .query({ cloudevent })
            .list(...fields)
            ;
        res.status(200).json(list);
    });
});