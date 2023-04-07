import environment from '@io/app/domain.test'
export default environment.define(function ({ step }) {
    step(/^dapr$/, async function () {
        const mock = environment.app.service('mock');
        mock.metadata().reply(200, {
            id: 'testonlyapp',
        });
    });
});
if (!require.main) {
    environment.launch(`${__dirname}/dapr.GET.feature`);
}