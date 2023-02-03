import cucumber from '@io/lib/cucumber.test'
export default cucumber.define(function () {
});
if (!require.main) {
    cucumber.launch(`${__dirname}/event.POST.feature`);
}