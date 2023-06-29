{// workaround for openapi example
    const v = require('ajv/dist/vocabularies/core/id') as {
        readonly default: ajv.CodeKeywordDefinition
    };
    v.default.code = function () {
        // to prevent throw error when read openapi example with 'id' field
    };
}
import type { OpenAPIV3_1 as v3 } from 'openapi-types'
import * as formats from 'ajv-formats'
import * as fs from 'node:fs'
import * as yaml from 'yaml'
import * as ajv from 'ajv'
import '@io/lib/error'
export const Ajv = formats.default(new ajv.default({
    strict: false,// workaround for openapi keywords
}));
export default Object.assign(JSON, <typeof JSON>{
    openapi(text) {
        try {
            if (!text.includes('\n')) {
                // check if file exist
                fs.accessSync(text);
                const yaml = fs.readFileSync(text, 'utf8');
                return this.openapi(yaml);
            }
        } catch {
            // eat for another way to find content
        }
        return Ajv.getSchema(text)?.schema ?? JSON.yaml(text
            // workaround to resolve parameter syntax for Ajv
            .replace(/required: true/g, '#')
        );
    },
    schema($id: string, def: object) {
        const ext = <Validator<unknown>>{
            node(...paths) {
                const root = $id.includes('#')
                    ? $id// already started from document
                    : `${$id}#`
                    ;
                return JSON.schema([
                    root,
                    ...paths,
                ].join('/'));
            },
            assert(data, e) {
                if (!this(data)) {
                    const message = this.errors
                        ?.map(e => e.message)
                        .filter(Boolean)
                        .join(', ')
                        ?? 'schema validation failed'
                        ;
                    throw Error.build({
                        name: Error.Code.SyntaxError,
                        reason: this.errors,
                        params: data,//! could be a large object
                        status: 400,
                        message,
                        ...e,
                    });
                }
            },
            attempt(data) {
                this.assert(data);
                return data;
            },
            foreach(cb) {
                this.map(cb);
            },
            find(cb) {
                const schema = this.schema as undefined
                    | Partial<Record<string, unknown>>
                    ;
                for (const [field,] of Object.entries(schema ?? {})) {
                    const node = this.node<never>(
                        field,
                    );
                    if (cb(node, field)) {
                        return node;
                    }
                }
                return undefined;// not found
            },
            map(cb) {
                const schema = this.schema as undefined
                    | Partial<Record<string, unknown>>
                    ;
                return Object.entries(schema ?? {}).map(([field,]) => {
                    const node = this.node<never>(
                        field,
                    );
                    return cb(node, field);
                }) as readonly unknown[];
            },
            as() {
                return this;
            },
        };
        const get = function () {
            return Object.assign(Ajv.getSchema(
                // ajv cannot resolve multi-reference
                JSON.pointer.resolve($id)
            ) ?? function DefaultValidator() {
                // prevent block caller
                return true;
            }, ext);
        };
        const set = function () {
            console.assert(def, 'schema should not be null or undefined');
            Ajv.removeSchema($id).addSchema(def, $id);
            return get();
        };
        return arguments.length === 1
            ? get()
            : set()
            ;
    },
    yaml(text) {
        return yaml.parse(text);
    },
    pointer: {
        resolve($id) {
            if (Ajv.getSchema($id)) {
                return $id;
            }
            if (!$id.length) {
                return $id;
            }

            const step = $id.split('/');
            const last = step.pop() ?? '';
            const prev = step.join('/');
            const vali = Ajv.getSchema(prev);
            if (!vali) return [
                this.resolve(prev),// try to resolve parent
                last,
            ].join('/');

            const dict = vali.schema as Record<string, v3.ReferenceObject | undefined>;
            const item = dict[last];
            const $ref = item?.$ref;
            const home = $id.split('#')[0];
            return this.resolve(`${home}${$ref}`);
        },
        escape(text) {
            return text
                .replace(/~/g, '~0')
                .replace(/\//g, '~1')
                ;
        },
    },
});
declare module 'openapi-types' {
    namespace OpenAPIV3 {
        interface Document {
            /**
            compatible to json schema
            */
            readonly $id?: string
        }
    }
}
declare global {
    namespace JSON {
        type Schema<V> = ajv.JSONSchemaType<V>;
    }
    interface JSON {
        /**
        parse text as YAML format
        */
        yaml<V>(text: string): V
        /**
        read file content as openapi
        */
        openapi<V extends object>(path: string): v3.Document<V>
        /**
        parse text as openapi format
        */
        openapi<V extends object>(text: string): v3.Document<V>
        /**
        find a document with the $id
        */
        openapi<V extends object>($id: string): v3.Document<V>
        /**
        define an openapi as json schema
        */
        schema<V extends object>($id: string, openapi: v3.Document<V>): Validator<object> & {
            readonly schema: typeof openapi
        }
        /**
        define a json schema
        */
        schema<V>($id: string, schema: ajv.JSONSchemaType<V>): Validator<V> & {
            readonly schema: typeof schema
        }
        /**
        find schema by given $id
        */
        schema<V>($id: string): Validator<V>
        /**
        utilities for JSON pointers described by RFC 6901, useful for openapi usage
        */
        readonly pointer: {
            resolve($id: string): string
            /**
            escapes a reference token
            */
            escape(text: string): string
        }
    }
}
type Validator<V> = ajv.ValidateFunction<V> & {
    /**
    throw error if invalid

    @return passed value
    */
    attempt<A extends V>(data: A): A
    /**
    throw error if invalid
    */
    assert(data: V, e?: Partial<Error>): never
    /**
    find sub-node by given paths
    */
    node<U extends unknown>(...paths: readonly string[]): Validator<U>
    /**
    iterate sub-node under this node, this is useful for openapi parameters

    @example
    const op = openapi.node(
        'paths',
        JSON.pointer.escape('/path/to/api'),
        'get',
        'parameters',
    );
    op.foreach(function(node) {
        node.as('openapi.parameter');
    });
    */
    foreach<A extends V>(cb: (node: Validator<A>, field: string) => void): void
    /**
    find sub-node like `array.find`
    */
    find<A extends V>(cb: (node: Validator<A>, field: string) => boolean): Validator<A> | undefined
    /**
    same as `.foreach`, but can return value at each
    */
    map<R, A extends V>(cb: (node: Validator<A>, field: string) => R): readonly R[]
    /**
    force convert type to, this is useful for openapi parameters
    */
    as<A>(): Validator<A>
    as<A extends unknown>(type: 'openapi.parameter'): Validator<A> & {
        readonly schema: v3.ParameterObject & v3.ReferenceObject
    }
};