import proc from 'node:child_process'
import os from 'node:os'
import '@io/lib/error'
//
Object.assign(os, <typeof os>{
    async uuid() {
        const id = await new Promise<string>(function (done, fail) {
            proc.exec('wmic csproduct get uuid', function (err, stdout, stderr) {
                return err ? fail(err) : done(stdout.toString());
            });
        }).then(function (stdout) {
            /**
            @example

            UUID
            0B2E9E87-9257-F743-83BD-A483DFA10418  \r\r
            */
            const id = stdout
                .split('\n')[1]
                ?.trim()
                ;
            if (!id?.length) {
                throw Error.build({
                    message: 'fail to extract uuid from os',
                    name: Error.Code.InternalError,
                    status: 500,
                    reason: { stdout },
                });
            }
            return id;
        });
        this.uuid = async () => {
            return id;
        };
        return id;
    },
});