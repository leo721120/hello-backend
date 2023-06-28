import express from '@io/app/express'
import os from 'node:os'
import '@io/lib/node'
export default express.service(function (app) {
    app.get('/metrics', async function (req, res) {
        const unit = 1;// TODO:

        // https://stackoverflow.com/questions/12023359/what-do-the-return-values-of-node-js-process-memoryusage-stand-for

        const mem = process.memoryUsage();
        const sys = {
            totalmem: os.totalmem() / unit,
            freemem: os.freemem() / unit,
        };
        const app = {
            rss: mem.rss / unit,
            totalheap: mem.heapTotal / unit,
            usedheap: mem.heapUsed / unit,
        };
        res.servertiming('collect').status(200).json({
            sys_freemem: sys.freemem,
            sys_totalmem: sys.totalmem,
            app_rss: app.rss,
            app_usedheap: app.usedheap,
            app_totalheap: app.totalheap,
        });
    });
});