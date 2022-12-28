import * as cucumber from 'jest-cucumber'
import * as autocannon from 'autocannon'
import * as express from 'express'
import * as event from 'events'
import * as fs from 'fs'
export default <Fixture>{
    async benchmark(options) {
        const namepipe = `//?/pipe/${process.cwd()}/.pipe`;
        const srv = options.app.listen(namepipe);
        await event.default.once(srv, 'listening');
        return autocannon.default({
            ...options,
            socketPath: namepipe,
        }).finally(function () {
            return event.default.once(srv.close(), 'close');
        });
    },
    launch(file, steps) {
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
            cucumber.autoBindSteps([feature], steps as []);
        }
        return this;
    },
    steps(cb) {
        return function ({ defineStep, given, when, then }) {
            cb({
                given,
                when,
                then,
                step: defineStep,
            });
        };
    },
    world(this: { ctx: typeof ctx }, ctx) {
        const get = () => {
            return this.ctx ?? {
            };
        };
        const set = () => {
            Object.assign(this, { ctx });
            return this;
        };
        return arguments.length === 0
            ? get()
            : set()
            ;
    },
}
interface Fixture {
    /**
    benchmarking tool for express service
    */
    benchmark(options: Partial<autocannon.Options> & {
        readonly app: express.Application
        readonly url: string
    }): Promise<autocannon.Result>
    launch(file: string, steps: readonly cucumber.StepDefinitions[]): this
    steps(cb: (options: {
        readonly given: cucumber.DefineStepFunction
        readonly when: cucumber.DefineStepFunction
        readonly then: cucumber.DefineStepFunction
        readonly step: cucumber.DefineStepFunction
    }) => void): cucumber.StepDefinitions
    world<V extends {}>(ctx: V): this
    world<V extends {}>(): V
}