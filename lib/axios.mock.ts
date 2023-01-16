import axios from '@io/lib/axios'
import nock from 'nock'
export default Object.assign(axios, {
    mock(fetch: ReturnType<typeof axios>) {
        return nock(fetch.defaults.baseURL ?? '');
    },
});