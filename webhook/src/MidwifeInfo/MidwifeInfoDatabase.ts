import { Context } from "@azure/functions";
import { Connection, ConnectionConfig, Request } from "tedious"
import { MidwifeInfo } from "./MidwifeInfo"
import { MidwifeInfoDatabaseConfig } from "./MidwifeInfoDatabaseConfig"

class MidwifeInfoDatabase {
    context: Context;
    config: ConnectionConfig;

    constructor(context: Context) {
        // Create connection to database
        var dbconfig = new MidwifeInfoDatabaseConfig();
        var config: ConnectionConfig =
        {
            authentication: {
                options: {
                    userName: dbconfig.userName,
                    password: dbconfig.password
                },
                type: 'default'
            },
            server: dbconfig.server,
            options:
            {
                database: dbconfig.databaseName,
                encrypt: true,
                rowCollectionOnDone: true,
                rowCollectionOnRequestCompletion: true
            }
        }

        this.config = config;
        this.context = context;
    }

    async GetMidwifeInfoAsync() {
        return new Promise((resolve: (value: MidwifeInfo[]) => void, reject) => {
            try {
                var connection = new Connection(this.config);
                connection.on('connect', function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        // Read all rows from table
                        var request = new Request(
                            "SELECT * from midwife_info",
                            function (err, rowCount, rows) {
                                if (err != null) {
                                    reject(err);
                                }
                                const infos = Array<MidwifeInfo>();
                                rows.forEach(function (columns) {
                                    var rowObject: { [key: string]: any; } = {};
                                    columns.forEach(function (column: any) {
                                        rowObject[column.metadata.colName] = column.value;
                                    });
                                    infos.push(new MidwifeInfo(rowObject))
                                });

                                resolve(infos);
                            }
                        );
                        connection.execSql(request);
                    }
                });
            } catch {
                reject();
            }
        })
    }

    async GetMidwifeInfoWithSupportTimeAsync(requestTime: number) {
        return new Promise((resolve: (value: MidwifeInfo[]) => void, reject) => {
            try {
                var connection = new Connection(this.config);
                connection.on('connect', function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        // Read all rows from table
                        var request = new Request(
                            `SELECT * from midwife_info where ${requestTime} >= support_time_start and support_time_end >= ${requestTime}`,
                            function (err, rowCount, rows) {
                                if (err != null) {
                                    reject(err);
                                }
                                const infos = Array<MidwifeInfo>();
                                rows.forEach(function (columns) {
                                    var rowObject: { [key: string]: any; } = {};
                                    columns.forEach(function (column: any) {
                                        rowObject[column.metadata.colName] = column.value;
                                    });
                                    infos.push(new MidwifeInfo(rowObject))
                                });

                                resolve(infos);
                            }
                        );
                        connection.execSql(request);
                    }
                });
            } catch {
                reject();
            }
        })
    }
}

export { MidwifeInfoDatabase, MidwifeInfoDatabaseConfig };