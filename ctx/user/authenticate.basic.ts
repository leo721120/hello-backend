import '@io/lib/node'
import '@io/lib/json'
export default {
    schema: JSON.schema<string[]>('authenticate-basic', {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: {
            type: 'string',
            minLength: 1,
            maxLength: 999,
        },
    }),
    decrypt(text: string) {
        const [username, password] = this.schema.attempt(
            text.decode('base64').split(':')
        );
        return {
            username,
            password,
        };
    },
};