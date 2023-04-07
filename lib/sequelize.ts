import * as sequelize from 'sequelize'
export * from 'sequelize'
export default function (options: sequelize.Options & {
    /**
    @example postgres://user:pass@localhost:5432/mydb
    @default sqlite:
    */
    readonly uri?: string
}) {
    const db = new sequelize.Sequelize(options.uri ?? 'sqlite:', {
        host: 'localhost',
        port: 5432,
        ...options,
    });
    return Object.assign(db, {
        DataTypes: sequelize.DataTypes,
        //Sequelize: sequelize,
        Op: sequelize.Op,
    });
}