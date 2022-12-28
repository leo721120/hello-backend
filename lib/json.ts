import type { OpenAPIV3_1 as OpenAPI } from 'openapi-types'
import * as formats from 'ajv-formats'
import * as fs from 'node:fs'
import * as yaml from 'yaml'
import * as ajv from 'ajv'
import '@io/lib/error'
export const Ajv = formats.default(new ajv.default({
    strict: false,// for openapi definition
}));
export default Object.assign(JSON, <typeof JSON>{
    openapi(text) {
        try {
            // check if file exist
            fs.accessSync(text);
            const yaml = fs.readFileSync(text, 'utf8');
            return this.openapi(yaml);
        } catch {
            return Ajv.getSchema(text)?.schema ?? JSON.yaml(text
                // workaround to resolve parameter syntax for Ajv
                .replace('required: true', 'required: []')
            );
        }
    },
    schema($id: string, def: object) {
        const get = function () {
            const obj = Ajv.getSchema(
                // ajv cannot resolve multi-reference
                JSON.pointer.resolve($id)
            ) ?? function () {
                return true;
            };
            return Object.assign(obj, <Validator<unknown>>{
                child(...paths) {
                    return JSON.schema([
                        `${$id}#`,
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
                        throw Error.Code({
                            message,
                            name: SyntaxError.name,
                            errno: 400,
                            ...e,
                        });
                    }
                },
                attempt(data) {
                    this.assert(data);
                    return data;
                },
            });
        };
        const set = function () {
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

            const dict = vali.schema as Dict<OpenAPI.ReferenceObject | undefined>;
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
declare global {
    interface JSON {
        /**
        parse text as YAML format
        */
        yaml<V>(text: string): V
        /**
        parse text as openapi format
        */
        openapi<V extends object>(text: string): OpenAPI.Document<V>
        /**
        read file content as openapi
        */
        openapi<V extends object>(path: string): OpenAPI.Document<V>
        /**
        find a document with the $id
        */
        openapi<V extends object>($id: string): OpenAPI.Document<V>
        /**
        define an openapi as json schema
        */
        schema<V extends object>($id: string, openapi: OpenAPI.Document<V>): Validator<object> & {
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
type Validator<V> = ajv.ValidateFunction<V> & {
    /**
    find sub-node by given paths
    */
    child<U extends object>(...paths: readonly string[]): Validator<U>
    /**
    throw error if invalid
    */
    assert<E extends Error>(data: V, e?: Partial<E>): never
    /**
    throw error if invalid

    @return passed value
    */
    attempt<A extends V>(data: A): A
};