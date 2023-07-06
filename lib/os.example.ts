import os from 'node:os'
import '@io/lib/node'
import '@io/lib/os'
//
Promise.try(async function () {
    const id = await os.uuid();
    {
        console.log({ id });
    }
}).catch(console.error);