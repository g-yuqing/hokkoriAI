// ADD THIS PART TO YOUR CODE
var config = {}

config.endpoint = process.env.CosmosDbEndpoint;
config.cosmosDbKey = process.env.CosmosDbKey;

// ADD THIS PART TO YOUR CODE
config.database = {
    "id": "hokkoriAI"
};

config.collection = {
    "id": "chatlog"
};

// ADD THIS PART TO YOUR CODE
module.exports = config;
