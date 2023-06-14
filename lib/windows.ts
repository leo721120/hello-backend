import { EventLogger } from 'node-windows'
export default {
    eventlog(name: string) {
        const log = new EventLogger({
            source: name,
        });
        return {
            warn(code: number, a: string) {
                return new Promise<void>(function (done, fail) {
                    log.warn(a, code, function (err) {
                        return err
                            ? fail(err)
                            : done()
                            ;
                    });
                });
            },
            info(code: number, a: string) {
                return new Promise<void>(function (done, fail) {
                    log.info(a, code, function (err) {
                        return err
                            ? fail(err)
                            : done()
                            ;
                    });
                });
            },
        };
    },
};