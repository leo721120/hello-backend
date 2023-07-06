import express from '@io/app/express'
import fs from 'fs-extra'
//
describe('.secret', function () {
    Object.assign(process.env, <typeof process.env>{
        SECRET_HOME: `./.tmp/${process.pid}/key`,
    });
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    afterAll(async function () {
        await fs.rm('./.tmp', {
            recursive: true,
            force: true,
        }).catch(console.error);
    });
    it('.get', async function () {
        const secret = app.secret('testonly');
        await expect(secret.has()).resolves.toBe(false);
        await secret.set({ key: 'abc1234' });
        await expect(secret.has()).resolves.toBe(true);
        await expect(secret.get()).resolves.toEqual({ key: 'abc1234' });
        await expect(secret.has()).resolves.toBe(true);
        await secret.del();
        await expect(secret.has()).resolves.toBe(false);
        await expect(secret.get()).resolves.toBeUndefined();
    });
});