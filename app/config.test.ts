import environment from '@io/app/domain.test'
export default environment.define(function ({ step }) {
});
if (!require.main) {
    environment.launch(`${__dirname}/config.GET.feature`);
}