import scenraio from '@io/lib/cucumber.spec'
import cucumber from '@io/lib/cucumber'
export default cucumber.steps(function () {
});
if (!require.main) cucumber.launch(`${__dirname}/version.spec.feature`, [
    exports.default,
    scenraio,
]);