import manifest from '@io/lib/manifest'
import win32 from '@io/lib/windows'
import '@io/lib/node'
//
Promise.try(async function () {
    const log = win32.eventlog(manifest.name);
    {
        await log.warn(400, 'fail');
    }
    {
        await log.info(200, 'pass');
    }
}).catch(console.error);