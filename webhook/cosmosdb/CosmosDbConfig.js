"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    endpoint: process.env.CosmosDbEndpoint,
    cosmosDbKey: process.env.CosmosDbKey,
    database: {
        'id': 'hokkoriAI'
    },
    collection: {
        'id': 'chatlog'
    }
};
exports.config = config;
