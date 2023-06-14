import os from 'node:os'
export const dhcp = require('dhcp') as {
    DHCPDISCOVER: 1
    DHCPOFFER: 2
    DHCPREQUEST: 3
    DHCPDECLINE: 4
    DHCPACK: 5
    DHCPNAK: 6
    DHCPRELEASE: 7
    DHCPINFORM: 8
    createClient(options: {
        readonly mac: string
    }): NodeJS.EventEmitter & {
        sendDiscover(): void
        listen(port?: number, host?: string): void
        close(): void
    }
};
export default Object.assign(dhcp, {
    /**
    find a network interface that is not internal
    , not loopback
    , not ipv6 (not supported for now)
    , not 00:00:00:00:00:00
    */
    interface(): os.NetworkInterfaceInfoIPv4 | undefined {
        const interfaces = os.networkInterfaces();

        for (const name in interfaces) {
            const list = interfaces[name] ?? [];

            for (const info of list) {
                if (info.internal) {
                    continue;
                }
                if (info.address === '127.0.0.1') {
                    continue;
                }
                if (info.address === '::1') {
                    continue;
                }
                if (info.mac === '00:00:00:00:00:00') {
                    continue;
                }
                if (info.family === 'IPv6') {
                    continue;
                }
                return info;
            }
        }
        return undefined;
    }
});