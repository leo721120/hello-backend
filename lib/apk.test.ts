import Apk from '@io/lib/apk'
//
describe('apk', function () {
    const apk = Apk(`${__dirname}/apk.rk3288`);

    it('.manifest', async function () {
        const info = await apk.getManifestInfo();
        expect(info.package).toBe('com.adv.client');
        expect(info.versionCode).toBe(21330);
        expect(info.versionName).toBe('21331.1c8b113.20230307.deviceon');
        expect(info.applicationLabel).toBe(2131492909);
        expect(info.applicationIcon).toBe(2131361793);
        expect([...info.permissions]).toEqual([
            'android.permission.CONTROL_KEYGUARD',
            'android.permission.DELETE_PACKAGES',
            'android.permission.PROVIDE_TRUST_AGENT',
            'android.permission.DUMP',
            'android.permission.SYSTEM_ALERT_WINDOW',
            'android.permission.REBOOT',
            'android.permission.BATTERY_STATS',
            'android.permission.DISABLE_KEYGUARD',
            'android.permission.WAKE_LOCK',
            'android.permission.ACCESS_NETWORK_STATE',
            'android.permission.ACCESS_WIFI_STATE',
            'android.permission.RECOVERY',
            'android.permission.STATUS_BAR',
            'android.permission.DEVICE_POWER',
            'android.permission.INTERNET',
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.WRITE_MEDIA_STORAGE',
            'android.permission.READ_PHONE_STATE',
            'android.permission.BLUETOOTH',
            'android.permission.BLUETOOTH_ADMIN',
            'android.permission.CHANGE_WIFI_STATE',
            'android.permission.RECEIVE_BOOT_COMPLETED',
            'android.permission.FORCE_STOP_PACKAGES',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.INSTALL_PACKAGES',
            'android.permission.REQUEST_INSTALL_PACKAGES',
            'android.permission.SET_ACTIVITY_WATCHER',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION',
            'android.permission.VIBRATE',
            'android.permission.CAMERA',
        ]);
        expect([...info.receivers].map(function (recv) {
            return {
                name: recv.name,
            };
        })).toEqual([
            { name: 'com.adv.client.service.ClientServiceBroadcastReceive' },
            { name: 'com.adv.client.service.AgentBroadcastReceiver' },
            { name: 'com.adv.client.utils.AppInstallResultReceiver' },
            { name: 'com.adv.client.utils.AppUnInstallResultReceiver' },
            { name: 'com.adv.client.utils.AppForceReInstall' },
            { name: 'client.plugin.devicelock.AdminRecieve' },
            { name: 'client.plugin.devicelock.UserPresentReceiver' },
            { name: 'com.adv.client.utils.ScreenShot$ScreenStatusReceiver' },
            { name: 'com.adv.client.service.ScheduleRebootTaskReceiver' },
            { name: 'com.adv.client.service.ScheduleSleepTaskReceiver' },
            { name: 'com.adv.client.service.ScheduleShutdownTaskReceiver' },
        ]);
    });
    it('.certificate', async function () {
        const list = await apk.getCertificateInfo();
        expect(list.length).toBe(1);
        expect(list.map(function (cert) {
            return {
                parent: cert.parent,
                serial: cert.serial,
                validFrom: cert.validFrom,
                validUntil: cert.validUntil,
                //issuer: cert.issuer,
                //subject: cert.subject,
            };
        })).toEqual([
            {
                serial: '00ff0641323cf95512',
                validFrom: new Date('2014-12-23T06:43:41.000Z'),
                validUntil: new Date('2042-05-10T06:43:41.000Z'),
            },
        ]);
    });
    it('.certificate, MD5', async function () {
        const apk2 = Apk(`${__dirname}/apk.20220822.aim75`);
        const apk3 = Apk(`${__dirname}/apk.20230307.aim75`);
        const cert3s = await apk3.getCertificateInfo();
        const cert2s = await apk2.getCertificateInfo();
        const cert1s = await apk.getCertificateInfo();
        expect(cert3s).toHaveLength(1);
        expect(cert2s).toHaveLength(1);
        expect(cert1s).toHaveLength(1);
        const cert3 = cert3s[0];
        const cert2 = cert2s[0];
        const cert1 = cert1s[0];
        expect(cert3.bytes.md5('hex')).toBe(cert2.bytes.md5('hex'));
        expect(cert3.bytes.md5('hex')).not.toBe(cert1.bytes.md5('hex'));
        expect(cert2.bytes.md5('hex')).not.toBe(cert1.bytes.md5('hex'));
    });
});