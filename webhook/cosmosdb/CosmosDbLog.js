"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cosmos = __importStar(require("@azure/cosmos"));
const CosmosDbConfig_1 = require("./CosmosDbConfig");
class CosmosDbLog {
    constructor(context) {
        const options = {
            endpoint: CosmosDbConfig_1.config.endpoint,
            auth: {
                masterKey: CosmosDbConfig_1.config.cosmosDbKey,
            }
        };
        this.cosmosClient = new Cosmos.CosmosClient(options);
        this.databaseId = CosmosDbConfig_1.config.database.id;
        this.collectionId = CosmosDbConfig_1.config.collection.id;
        this.database = null;
        this.container = null;
        this.context = context;
    }
    async init() {
        try {
            const databaseDefinition = { id: this.collectionId };
            const dbResponse = await this.cosmosClient.databases.createIfNotExists(databaseDefinition);
            this.database = dbResponse.database;
            const containerDefinition = { id: this.collectionId };
            const containeResponse = await this.cosmosClient.database(this.databaseId).containers.createIfNotExists(containerDefinition);
            this.container = containeResponse.container;
        }
        catch (err) {
            this.context.log('Something happen on the logger database init');
            this.context.log(err);
        }
    }
    async upsertUserLog(item) {
        try {
            await this.container.items.upsert(item);
        }
        catch (err) {
            this.context.log("Something happend in CosmosDb AddItem.");
            this.context.log(err);
        }
    }
    async findUserLogByIdIn30Min(id) {
        try {
            const findTimeStampUntil = Date.now() - 1800000; // 30分前から取得
            const cosmosQuery = `SELECT * FROM root r WHERE r.userId = "${id}" and r.updateAt > ${findTimeStampUntil} and r.feedback="none"`;
            const { result: response } = await this.container.items.query(cosmosQuery).toArray();
            return response;
        }
        catch (err) {
            this.context.log('Find item from database was failed with the error below');
            this.context.log(err);
            return [];
        }
    }
}
exports.CosmosDbLog = CosmosDbLog;
