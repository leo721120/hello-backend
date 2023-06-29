import environment from '@io/app/domain.test'
export default environment.define(function ({ step }) {
    step(/^configs$/, async function (list: readonly Record<'name' | 'data', string>[]) {
        const Model = environment.app.service('config/model');
        await Model.bulkCreate(
            list.map(function ({ name, data }) {
                return {
                    name,
                    data: JSON.parse(data),
                };
            })
        );
    });
});
if (!require.main) {
    environment.launch(`${__dirname}/config.GET.feature`);
}