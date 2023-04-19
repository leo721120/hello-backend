import { GenericContainer } from 'testcontainers'
import express from '@io/lib/express'
//
describe('amqp', function () {
    const app = express();

    beforeAll(async function () {
        const rabbitmq = await new GenericContainer('bitnami/rabbitmq:3.9.16')
            .withExposedPorts(5672)
            .withEnvironment({
                RABBITMQ_VHOST: '/',
                //RABBITMQ_VHOSTS: []
                RABBITMQ_USERNAME: 'admin',
                RABBITMQ_PASSWORD: 'admin',
                RABBITMQ_SECURE_PASSWORD: 'no',
                RABBITMQ_LOAD_DEFINITIONS: 'no',
                //RABBITMQ_PLUGINS: rabbitmq_shovel; rabbitmq_management
            })
            .start()
            .catch(function(e) {
                console.error(e);
                return {// dummy container
                    stop() {
                    },
                };
            })
            ;
        app.once('close', function () {
            rabbitmq.stop();
        });
    });
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    afterAll(async function () {
        app.emit('close');
    });
    it.skip('.consume', async function () {
        const queue = 'q.test.only';
        const conn = await app.service('amqp');
        const ch1 = await conn.createChannel();
        const q1 = await ch1.assertQueue(queue, {
            exclusive: true,
            durable: true,
            autoDelete: true,
            expires: 1000,
            messageTtl: 1000,
        });
        const messages = [] as unknown[];
        await ch1.consume(q1.queue, function (message) {
            messages.push(message?.content.toString());
        });
        {
            const ch2 = await conn.createChannel();
            ch2.sendToQueue(queue, Buffer.from('this is test only'));
        }
        for (let i = 0; i < 100; i++) {
            await Promise.sleep(10);

            if (messages.length) {
                break;
            }
        }
        expect(messages.length).toBe(1);
        expect(messages[0]).toBe('this is test only');
    });
});