class MidwifeInfoDatabaseConfig {
    userName: string = process.env.MidwifeInfoDatabaseUserName!
    password: string = process.env.MidwifeInfoDatabasePassword!
    server: string = process.env.MidwifeInfoDatabaseServer!
    databaseName: string = process.env.MidwifeInfoDatabaseName!
}

export { MidwifeInfoDatabaseConfig }