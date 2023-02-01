import type { Tag, Find } from '@io/ctx/tag/model'
import express from '@io/lib/express'
import tag from '@io/ctx/tag/model'
import '@io/lib/node'
export interface Collection {
    list<K extends keyof Tag>(...fields: K[]): Promise<readonly Pick<Tag, K | 'id'>[]>
}
export interface Service extends Collection {
    model(): Promise<ReturnType<typeof tag.model>>
    query(find: Find<object>): Collection
}
export default express.service(function (app) {
    app.service('tag', function () {
        return Service(app, {
        });
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'tag'): Promise<Service>
        }
    }
}
function Service(
    app: Express.Application,
    find: Find<object>,
): Service {
    return {
        query(options) {
            return Service(app, {
                ...find,
                ...options,
            });
        },
        async model() {
            const db = await app.service('db');
            return tag.model(db);
        },
        async list(...fields) {
            const Model = await this.model();
            const attrs = Object.keys(Model.getAttributes());
            const scopes = Object.keys(Model.options.scopes ?? {});
            const list = await Model.scope(
                [
                    ...(fields.length ? fields : scopes) as typeof attrs,
                ].filter(field => {
                    return !attrs.includes(field);
                }).filter(field => {
                    return scopes.includes(field);
                })
            ).findAll({
                ...find,
                //
                attributes: [...fields as typeof attrs, 'id'].filter(field => {
                    return attrs.includes(field);
                }),
            });
            return list.map(item => item.toJSON());
        },
    };
}