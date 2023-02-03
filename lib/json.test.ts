import '@io/lib/json'
//
describe('json', function () {
    it('.schema', async function () {
        interface data {
            txt: string
            num: number
        }
        const schema = JSON.schema<data>('abc', {
            type: 'object',
            required: ['txt', 'num'],
            properties: {
                txt: {
                    type: 'string',
                },
                num: {
                    type: 'number',
                },
            },
        });
        expect(schema({ txt: 'a', num: 3 })).toBe(true);
        expect(schema.errors?.length).toBe(undefined);
        expect(schema({ txt: 123, num: 3 })).toBe(false);
        expect(schema.errors?.length).toBe(1);
    });
    it('.schema, empty schema if not found', async function () {
        const schema = JSON.schema('not-exist');
        expect(schema({ txt: 'a', num: 3 })).toBe(true);
        expect(schema.errors?.length).toBe(undefined);
    });
    it('.schema, openapi definition', async function () {
        const openapi = JSON.openapi(`${__dirname}/json.spec.yml`);
        JSON.schema('testonly/openapi', openapi);
        {
            const schema = JSON.schema('testonly/openapi#/paths/~1foo/post/responses/200/content/application~1json/schema');
            expect(schema({})).toBe(true);
            expect(schema({ a: 'b' })).toBe(true);
            expect(schema({ a: 1 })).toBe(false);
            expect(schema({ b: 1 })).toBe(false);
            expect(schema(1)).toBe(false);
            expect(schema('a')).toBe(false);
            expect(schema([])).toBe(false);
        }
        {
            const schema = JSON.schema('testonly/openapi#/paths/~1foo~1{id}/get/responses/200/content/application~1json/schema');
            expect(schema({})).toBe(true);
            expect(schema({ a: 'b' })).toBe(true);
            expect(schema({ a: 1 })).toBe(false);
            expect(schema({ b: 1 })).toBe(false);
            expect(schema(1)).toBe(false);
            expect(schema('a')).toBe(false);
            expect(schema([])).toBe(false);
        }
    });
    it('.assert', async function () {
        interface data {
            txt: string
            num: number
        }
        JSON.schema<data>('abc', {
            type: 'object',
            required: ['txt', 'num'],
            properties: {
                txt: {
                    type: 'string',
                },
                num: {
                    type: 'number',
                },
            },
        });
        const fn = function () {
            JSON.schema('abc').assert({
                abc: '123',
            });
        };
        expect(fn).toThrowError("must have required property 'txt'");
    });
    it('.attempt', async function () {
        interface data {
            txt: string
            num: number
        }
        JSON.schema<data>('abc', {
            type: 'object',
            required: ['txt', 'num'],
            properties: {
                txt: {
                    type: 'string',
                },
                num: {
                    type: 'number',
                },
            },
        });
        const a = JSON.schema('abc').attempt({
            txt: 'aaa',
            num: 98901,
        });
        expect(a).toEqual({
            txt: 'aaa',
            num: 98901,
        });
    });
    it('.yaml', async function () {
        interface V {
            a: number
            b: string
            d: {
                e: ['f']
            }
        }
        const yaml = JSON.yaml<V>(`
        a: 1
        b: 'c'
        d:
          e: ['f']
        `);
        expect(yaml.a).toBe(1);
        expect(yaml.b).toBe('c');
        expect(yaml.d).toEqual({ e: ['f'] });
    });
    it('.openapi, parse from content', async function () {
        const doc = JSON.openapi(`
        info:
          version: 1.2.3
          title: testonly
        `);
        expect(doc.info.version).toBe('1.2.3');
        expect(doc.info.title).toBe('testonly');
    });
    it('.openapi, read from file', async function () {
        const doc = JSON.openapi(`${__dirname}/json.spec.yml`);
        expect(doc.info.version).toBe('1.2.3');
        expect(doc.info.title).toBe('testonly');
    });
    it('.openapi, find by id', async function () {
        {
            const doc = JSON.openapi(`${__dirname}/json.spec.yml`);
            JSON.schema('abc.yml', doc);
        }
        const doc = JSON.openapi(`abc.yml`);
        expect(doc.info.version).toBe('1.2.3');
        expect(doc.info.title).toBe('testonly');
    });
    it('.openapi, example with key `id`', async function () {
        const doc = JSON.openapi(`${__dirname}/json.spec.yml`);
        const schema = JSON.schema('abc.yml', doc);
        const example = schema.child(
            'paths',
            JSON.pointer.escape('/foo/{id}'),
            'get',
            'responses',
            '200',
            'content',
            JSON.pointer.escape('application/json'),
            'example',
        );
        expect(example.schema).toEqual({
            id: 'id-testonly',
        });
    });
    it('.pointer', async function () {
        expect(JSON.pointer.escape('/abc/{id}')).toBe('~1abc~1{id}');
    });
});