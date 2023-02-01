import type { MongoClientOptions } from 'mongodb'
import { MongoClient } from 'mongodb'
import express from '@io/lib/express'
import '@io/lib/node'
export default express.service(function (app) {
    app.service('mongo', async function () {
        const uri = new URL(process.env.MONGODB_HREF ?? 'mongodb://localhost:27017');
        const options = await Promise.try<MongoClientOptions>(function () {
            return {
                ...JSON.parse(process.env.MONGODB_OPTIONS ?? '{}'),
            };
        });
        const db = await MongoClient.connect(uri.href, {
            ...options,
            appName: process.env.APP_ID,
        });
        Object.assign(uri, <typeof uri>{// omit sensitive information
            password: '',
        });
        app.once('close', function () {
            // force close if application is going down
            db.close();
        }).emit('event', await Promise.try(function () {
            return CloudEvent({
                id: CloudEvent.EMPTY_ID,
                source: uri.toString(),
                data: undefined,
                type: 'mongo',
                text: 'connect',
            });
        }));
        db.on('close', function () {
            app.emit('event', CloudEvent({
                id: CloudEvent.EMPTY_ID,
                source: uri.toString(),
                data: undefined,
                type: 'mongo',
                text: 'connect',
            }));
        }).on('timeout', function () {
            app.emit('event', CloudEvent({
                id: CloudEvent.EMPTY_ID,
                source: uri.toString(),
                data: undefined,
                type: 'mongo',
                text: 'timeout',
            }));
        }).on('commandFailed', function (e) {
            /*app.emit('error', {
                name: e.requestId,
                text: e.commandName,
                elapse: e.duration,
                reason: e.failure.message,
            });*/
        }).on('commandStarted', function (e) {
            /*app.emit('event', {
                name: e.requestId,
                text: e.commandName,
            });*/
        }).on('commandSucceeded', function (e) {
            /*app.emit('event', {
                name: e.requestId,
                text: e.commandName,
                elapse: e.duration,
            });*/
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
            service(name: 'mongo'): Promise<MongoClient>
        }
    }
}