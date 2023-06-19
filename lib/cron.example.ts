import cron from 'cron'
import '@io/lib/node'
//
Promise.try(async function() {
    {
        const a = [];
        const j = cron.job('* * * * * *', function() {
            a.push(true);
            console.log('tick', a.length);

            if (a.length > 30) {
                console.log('stop');
                j.stop();
            }
        });
        j.start();
    }
}).catch(console.error);