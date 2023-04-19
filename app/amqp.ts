import express from '@io/lib/express'
import amqp from 'amqplib'
import '@io/lib/event'
import '@io/lib/node'
export default express.service(function (app) {
    app.service('amqp', async function () {
        const uri = new URL(process.env.AMQP_HREF ?? 'amqp://admin:admin@localhost:5672');
        const connection = await amqp.connect(uri.toString());
        {
            app.once('close', function () {
                connection.close();
            });
        }
        return connection;
    });
});
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
            @default amqp://localhost:5672
            */
            readonly AMQP_HREF?: string
        }
    }
    namespace Express {
        interface Application {
            service(name: 'amqp'): ReturnType<typeof amqp.connect>
        }
    }
}