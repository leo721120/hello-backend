import environment from '@io/lib/cucumber'
export default environment.define(function ({ step }) {
    step(/^step 1$/, async function () {
    });
    step(/^step 2$/, async function () {
    });
    step(/^act$/, async function () {
    });
    step(/^expect good$/, async function () {
    });
}).launch(`${__dirname}/cucumber.feature`);