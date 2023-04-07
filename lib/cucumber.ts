import * as cucumber from 'jest-cucumber'
import * as fs from 'fs'
export interface Definition {
    readonly step: cucumber.DefineStepFunction
}
export interface Fixture {
    define(cb: (options: Definition) => void): this
    launch(file: string, ...more: readonly string[]): void
}
export const definitions = [] as cucumber.StepDefinitions[];
export default <Fixture>{
    define(cb) {
        definitions.push((options) => {
            cb(Object.assign(options, {
                step: options.defineStep,
            }));
        });
        return this;
    },
    launch(...list) {
        cucumber.autoBindSteps(list.map(function (file) {
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
                return feature;
            }
        }), definitions);
    },
};