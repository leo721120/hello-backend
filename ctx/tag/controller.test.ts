import environment from '@io/app/domain.test'
export default environment.define(function ({ step }) {
    step(/^new tags$/, async function (list: readonly []) {
        const service = await environment.app.service('tag');
        const db = await service.model();
        await db.sync({ force: true });
        await db.bulkCreate(list);
    });
});
if (!require.main) {
    environment.launch(`${__dirname}/controller.GET.feature`);
}