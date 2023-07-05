import express from '@io/app/express'
import down from './shadow.down'
import up from './shadow.up'
export interface Shadow<V extends object> {
    /**
    used to sync data between real and shadow
    */
    sync(): Promise<void>
    /**
    used to save data from shadow to database
    */
    save(): Promise<void>
    /**
    used to load data from database to shadow
    */
    load(): Promise<void>

    get<R extends V>(): Promise<R>
    get<K extends keyof V>(field: K): Promise<V[K]>
    set<K extends keyof V>(field: K, value: V[K]): Promise<void>
    del<K extends keyof V>(field: K): Promise<void>
}
export default express.service(function (app) {
    app.service<Shadows>('shadows', function () {
        return {
            down,
            up,
        };
    });
});
declare global {
    namespace Express {
        interface Application {
            service(name: 'shadows'): Shadows
        }
    }
}
interface Shadows {
    down: typeof down
    up: typeof up
}