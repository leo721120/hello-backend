import type { Socket } from 'node:dgram'
export const impl = require('dhcp') as {
    DHCPDISCOVER: 1
    DHCPOFFER: 2
    DHCPREQUEST: 3
    DHCPDECLINE: 4
    DHCPACK: 5
    DHCPNAK: 6
    DHCPRELEASE: 7
    DHCPINFORM: 8
    createClient(options: {
        readonly mac?: string
    }): NodeJS.EventEmitter & {
        sendDiscover(): void
        listen(): void
        close(): void
        config(key: 'mac'): string
        _send(host: string, data: unknown): void
        readonly _state: {
            xid: number
            state: string
            tries: number
        }
    }
}
export default {
    client(options: ClientOptions): Client {
        const INADDR_BROADCAST = '255.255.255.255';
        const INADDR_ANY = '0.0.0.0';
        const BOOTREQUEST = 1;
        //const BOOTREPLY = 2;
        const client = impl.createClient({
            mac: options.mac,
        });
        return Object.assign(client, <Client>{
            discover() {
                const mac = client.config('mac');
                const ans = {
                    op: BOOTREQUEST,
                    htype: 1, // RFC1700, hardware types: 1=Ethernet, 2=Experimental, 3=AX25, 4=ProNET Token Ring, 5=Chaos, 6=Tokenring, 7=Arcnet, 8=FDDI, 9=Lanstar (keep it constant)
                    hlen: 6, // Mac addresses are 6 byte
                    hops: 0,
                    xid: client._state.xid++, // Selected by client on DHCPDISCOVER
                    secs: 0, // 0 or seconds since DHCP process started
                    flags: 0xFFFF, // 0 or 0x80 (if client requires broadcast reply)
                    ciaddr: INADDR_ANY, // 0 for DHCPDISCOVER, other implementations send currently assigned IP - but we follow RFC
                    yiaddr: INADDR_ANY,
                    siaddr: INADDR_ANY,
                    giaddr: INADDR_ANY,
                    chaddr: mac,
                    sname: '', // unused
                    file: '', // unused
                    options: {
                        57: 1500, // Max message size
                        53: impl.DHCPDISCOVER,
                        61: mac, // MAY
                        //55: this.config('features') // MAY
                        // TODO: requested IP optional
                    }
                };
                client._state.state = 'SELECTING';
                client._state.tries = 0;
                client._send(INADDR_BROADCAST, ans);
            },
        });
    },
}
interface ClientOptions {
    readonly mac?: string | '00:00:00:00:00:00'
}
interface Client extends NodeJS.EventEmitter {
    once(event: 'listening', cb: (a: Socket) => void): this
    off(event: 'listening', cb: (a: Socket) => void): this
    on(event: 'listening', cb: (a: Socket) => void): this
    once(event: 'message', cb: (a: object) => void): this
    off(event: 'message', cb: (a: object) => void): this
    on(event: 'message', cb: (a: object) => void): this
    once(event: 'bound', cb: (a: unknown) => void): this
    off(event: 'bound', cb: (a: unknown) => void): this
    on(event: 'bound', cb: (a: unknown) => void): this
    once(event: 'error', cb: (e: Error) => void): this
    off(event: 'error', cb: (e: Error) => void): this
    on(event: 'error', cb: (e: Error) => void): this
    once(event: 'close', cb: () => void): this
    off(event: 'close', cb: () => void): this
    on(event: 'close', cb: () => void): this
    discover(): void
    listen(): void
    close(): void
}