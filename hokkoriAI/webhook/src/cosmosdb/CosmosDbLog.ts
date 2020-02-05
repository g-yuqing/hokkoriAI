import { Context } from "@azure/functions";
import * as Cosmos from "@azure/cosmos";
import { config } from "./CosmosDbConfig";
import { UserLog } from "./UserLog";

class CosmosDbLog {
    cosmosClient: Cosmos.CosmosClient;
    databaseId: string;
    collectionId: string;
    database: Cosmos.Database | null;
    container: Cosmos.Container | null;
    context: Context;

    constructor(context: Context) {
        const options: Cosmos.CosmosClientOptions = {
            endpoint: config.endpoint,
            auth: {
                masterKey: config.cosmosDbKey,
            }
        };
        this.cosmosClient = new Cosmos.CosmosClient(options);
        this.databaseId = config.database.id;
        this.collectionId = config.collection.id
        this.database = null;
        this.container = null;
        this.context = context;
    }

    async init() {
        try {
            const databaseDefinition: Cosmos.DatabaseDefinition = { id: this.collectionId };
            const dbResponse = await this.cosmosClient.databases.createIfNotExists(databaseDefinition);
            this.database = dbResponse.database;

            const containerDefinition: Cosmos.ContainerDefinition = { id: this.collectionId };
            const containeResponse = await this.cosmosClient.database(this.databaseId).containers.createIfNotExists(containerDefinition);
            this.container = containeResponse.container;

        } catch (err) {
            this.context.log('Something happen on the logger database init');
            this.context.log(err);
        }
    }

    async upsertUserLog(item: UserLog) {
        try {
            await this.container!.items.upsert(item)
        } catch (err) {
            this.context.log("Something happend in CosmosDb AddItem.");
            this.context.log(err);
        }
    }

    async findUserLogByIdIn30Min(id: string): Promise<Array<UserLog>> {
        try {
            const findTimeStampUntil: number = Date.now() - 1800000; // 30分前から取得
            const cosmosQuery = `SELECT * FROM root r WHERE r.userId = "${id}" and r.updateAt > ${findTimeStampUntil} and r.state!="none"`;
            const { result: response } = await this.container!.items.query(cosmosQuery).toArray()
            return response as UserLog[];
        } catch (err) {
            this.context.log('Find item from database was failed with the error below')
            this.context.log(err)
            return [];
        }
    }
}

export { CosmosDbLog };