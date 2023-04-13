import express from '@io/lib/express'
export interface Identifiable {
    readonly id: string
}
export default express.service(async function (app) {
    await app.setup(await import('@io/app/authenticate.basic'));
    await app.setup(await import('@io/app/authenticate.jwt'));
});