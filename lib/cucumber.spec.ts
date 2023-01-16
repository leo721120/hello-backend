import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import cucumber from '@io/lib/cucumber'
import express from '@io/lib/express'
export interface World {
    app?: ReturnType<typeof express>
    res?: AxiosResponse
    req?: AxiosRequestConfig
}
export default cucumber.steps(function ({ step }) {
    interface Header {
        readonly name: string
        readonly value: string
    }
    step(/^new environment$/, async function () {
        const app = express().on('error', function (e) {
            if (process.env.DEBUG) {
                console.error(e);
            }
        });
        {
            await app.setup(await import('@io/app/domain'));
            await app.setup(await import('@io/app/mock'));
        }
        cucumber.world<World>({
            req: {},
            app,
        });
    });
    step(/^login$/, async function (list: readonly []) {
        const w = cucumber.world<World>();
        const req = w.req ?? {};
        for (const auth of list) {
            Object.assign(req, { auth });
        }
    });
    step(/^url (.+)$/, function (url: string) {
        const w = cucumber.world<World>();
        const req = w.req ?? {};
        Object.assign(req, { url });
    });
    step(/^headers$/, function (list: readonly Header[]) {
        const w = cucumber.world<World>();
        const req = w.req ?? {};
        for (const item of list) {
            req.headers = {
                ...req.headers,
                [item.name]: item.value,
            };
        }
    });
    step(/^json$/, function (text: string) {
        const w = cucumber.world<World>();
        const req = w.req ?? {};
        Object.assign(req, { data: JSON.parse(text) });
    });
    step(/^method (\w+)$/, async function (method: string) {
        const w = cucumber.world<World>();
        const req = w.req ?? {};
        Object.assign(req, { method });
        const res = await w.app?.fetch(req);
        Object.assign(w, { res });
    });
    step(/^expect status should be (\d+)$/, function (status: string) {
        const w = cucumber.world<World>();
        expect(w.res?.status).toBe(+status);
    });
    step(/^expect headers should contain$/, function (list: readonly Header[]) {
        const w = cucumber.world<World>();

        for (const item of list) {
            expect(w.res?.headers?.[item.name]).toContain(item.value);
        }
    });
    step(/^expect body should be json$/, function (text: string) {
        const w = cucumber.world<World>();
        expect(w.res?.headers?.['content-type']).toContain('json');
        expect(w.res?.data).toEqual(JSON.parse(text));
    });
});
if (!require.main) cucumber.launch(`${__dirname}/cucumber.spec.feature`, [
    exports.default,
]);