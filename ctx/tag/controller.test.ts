import cucumber from '@io/lib/cucumber.test'
export default cucumber.define(function (environment, { step }) {
    step(/^new tags$/, async function (list: readonly []) {
        const service = await environment.app.service('tag');
        const db = await service.model();
        await db.sync({ force: true });
        await db.bulkCreate(list);
    });
});
if (!require.main) {
    cucumber.launch(`${__dirname}/controller.GET.feature`);
}