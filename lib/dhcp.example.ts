import dhcp from '@io/lib/dhcp'
import '@io/lib/node'
//
Promise.try(async function () {
    const s = dhcp.client({
    });
    s.on('error', function (e) {
        console.error(e);
    }).on('bound', function (e) {
        console.log(e);
    }).on('message', function (e) {
        console.log(e);
    }).on('listening', function (socket) {
        console.log('listening', socket.address());
        {
            s.discover();
        }
    }).on('close', function () {
        console.log('close');
    });
    s.listen();
}).catch(console.error);