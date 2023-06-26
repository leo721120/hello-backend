import { MongoClient } from 'mongodb'
import express from '@io/app/express'
export default express.service(function (app) {
    app.service('mongo', function () {
        const uri = new URL(process.env.MONGODB_HREF ?? 'mongodb://localhost:27017');
        const db = new MongoClient(uri.toString(), {
            ...JSON.parse(process.env.MONGODB_OPTIONS ?? '{}'),
            appName: process.env.APP_ID ?? 'devapp',
        });
        app.once('close', function () {
            // force close if application is going down
            db.close();
        });
        return db;
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            @default mongodb://localhost:27017
            */
            readonly MONGODB_HREF?: string
            readonly MONGODB_OPTIONS?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'mongo'): MongoClient
        }
    }
}