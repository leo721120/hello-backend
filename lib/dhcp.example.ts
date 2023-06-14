import dhcp from '@io/lib/dhcp'
import '@io/lib/node'
//
Promise.try(async function () {
    const info = dhcp.interface();
    const s = dhcp.createClient({
        mac: info?.mac ?? '00:00:00:00:00:00',
    });
    s.on('error', function (e) {
        console.error(e);
    }).on('bound', function (e) {
        console.log(e);
    }).on('message', function (e) {
        console.log(e);
    }).once('listening', function (socket) {
        console.log('listening', info);
        s.sendDiscover();
        console.log('discover');
    }).once('close', function () {
        console.log('close');
    });

    s.listen();
}).catch(console.error);