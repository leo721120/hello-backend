import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import express from '@io/lib/express'
import dapr from '@io/lib/dapr'
import '@io/lib/node'
export interface Mock extends ReturnType<typeof dapr.mock> {
}
export default express.service(function (app) {
    console.assert(process.env.NODE_ENV !== 'production',
        'should not use mock objects in production'
    );
    app.service('mock', function () {
        const fetch = app.service('dapr');
        return dapr.mock(fetch);
    });
    MongoClient.connect = Function.monkeypatch(MongoClient.connect.bind(MongoClient), function (cb) {
        return async function (_, ...options: []) {
            const db = await MongoMemoryServer.create();

            app.once('close', function () {
                db.stop();
            });
            return cb(db.getUri(), ...options);
        };
    });
});
declare global {
    namespace Express {
        interface Application {
            /**
            mock object, only for test
            */
            service(name: 'mock'): Mock
        }
    }
}