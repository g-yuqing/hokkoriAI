const config = {
  endpoint: process.env.CosmosDbEndpoint,
  cosmosDbKey: process.env.CosmosDbKey,
  database: {
    'id': 'hokkoriAI'
  },
  collection: {
    'id': 'chatlog'
  }
}
module.exports = config
