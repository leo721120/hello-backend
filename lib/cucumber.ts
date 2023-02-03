import * as cucumber from 'jest-cucumber'
import * as fs from 'fs'
export interface Fixture {
    readonly definitions: cucumber.StepDefinitions[]
    define(cb: (context: Fixture, options: Definition) => void): this
    launch(file: string): void
}
export default <Fixture>{
    definitions: [] as Fixture['definitions'],
    //
    define(cb) {
        this.definitions.push((options) => {
            cb(this, Object.assign(options, {
                step: options.defineStep,
            }));
        });
        return this;
    },
    launch(file) {
        const text = fs.readFileSync(file).toString();
        const only = text.includes('@only');
        {
            const feature = cucumber.parseFeature(text, {
                tagFilter: only ? '@only' : 'not @skip',
                errors: true,
            });
            {// hotfix
                const outlines = [];
                for (const outline of feature.scenarioOutlines) {
                    for (const scenario of outline.scenarios) {
                        outlines.push({
                            ...outline,
                            scenarios: [scenario],
                            //if scenario title !== outline title, step will be skipped
                            title: scenario.title,
                        });
                    }
                }
                feature.scenarioOutlines = outlines;
            }
            cucumber.autoBindSteps([feature], this.definitions);
        }
    },
};
interface Definition {
    readonly given: cucumber.DefineStepFunction
    readonly when: cucumber.DefineStepFunction
    readonly then: cucumber.DefineStepFunction
    readonly step: cucumber.DefineStepFunction
}