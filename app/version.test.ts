import environment from '@io/app/domain.test'
export default environment.define(function () {
});
if (!require.main) {
    environment.launch(
        `${__dirname}/version.GET.feature`,
    );
}