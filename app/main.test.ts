import axios from 'axios'
//
describe('main', function () {
    const main = import('@io/app/main');

    beforeAll(async function () {
        const app = await main;
        const srv = await app.default;
        await new Promise(function (done) {
            srv.once('listening', done);
        });
    });
    afterAll(async function () {
        const app = await main;
        const srv = await app.default;
        await new Promise(function (done) {
            srv.close(done);
        });
    });
    it('.', async function () {
        const app = await main;
        const srv = await app.default;
        const addr = srv.address() as {
            readonly port: number
        };
        const res = await axios.get(`http://localhost:${addr.port}/versions`);
        expect(res.status).toBe(200);
    });
});
if (!process.env.LOG_LEVEL) {
    Object.assign(process.env, <typeof process.env>{
        LOG_LEVEL: 'silent',
    });
}