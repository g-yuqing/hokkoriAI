// // ADD THIS PART TO YOUR CODE
// const config = {}
//
// config.endpoint = process.env.CosmosDbEndpoint
// config.cosmosDbKey = process.env.CosmosDbKey
//
// // ADD THIS PART TO YOUR CODE
// config.database = {
//   'id': 'hokkoriAI'
// }
//
// config.collection = {
//   'id': 'chatlog'
// }
//
// // ADD THIS PART TO YOUR CODE
// module.exports = config

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
