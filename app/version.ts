import express from '@io/lib/express'
export default express.setup(function (app) {
    const service = {
        async manifest() {
            const path = require.resolve('../package.json');
            const data = require(path);
            return data as Manifest;
        },
    };
    app.get('/version', async function (req, res) {
        const info = await service.manifest();
        res.status(200).json({
            version: info.version,
        });
    });
});
interface Manifest {
    /**
    version for application
    */
    readonly version: string
}