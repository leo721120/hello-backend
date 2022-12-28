import type { World } from '@io/lib/cucumber.spec'
import scenraio from '@io/lib/cucumber.spec'
import cucumber from '@io/lib/cucumber'
export default cucumber.steps(function ({ step }) {
    step(/^new tags$/, async function (list: readonly []) {
        const w = cucumber.world<World>();
        const service = await w.app?.service('tag');
        const db = await service?.model();
        await db?.sync({ force: true });
        await db?.bulkCreate(list);
    });
});
if (!require.main) cucumber.launch(`${__dirname}/controller.spec.GET.feature`, [
    exports.default,
    scenraio,
]);