import cucumber from '@io/lib/cucumber.spec'
export default cucumber.define(function () {
});
if (!require.main) {
    cucumber.launch(`${__dirname}/version.spec.feature`);
}