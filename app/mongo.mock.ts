import { MongoMemoryServer } from 'mongodb-memory-server'
import express from '@io/lib/express'
import '@io/lib/event'
import '@io/lib/node'
export default express.service(async function (app) {
    const srv = await MongoMemoryServer.create({
    });
    app.once('close', function () {
        srv.stop();
    }).emit('event', {
        source: '/mock/mongodb',
        type: 'mock.mongodb',
    });
    Object.assign(process.env, <typeof process.env>{
        MONGODB_HREF: srv.getUri(),
    });
});