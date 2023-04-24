import { Apk } from 'node-apk'
import '@io/lib/node'
export default function (path: string) {
    const apk = new Apk(path);
    return Object.assign(apk, {
    });
}