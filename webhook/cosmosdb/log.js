'use strict'
const documentClient = require('documentdb').DocumentClient,
  config = require('./config')

module.exports = class CosmosDbLog {
  constructor() {
    this._client = new documentClient(config.endpoint, {'masterKey': config.cosmosDbKey})
    this._HttpStatusCodes = {NOTFOUND: 404}
    this._databaseUrl = `dbs/${config.database.id}`
    this._collectionUrl = `${this._databaseUrl}/colls/${config.collection.id}`
  }

  getDatabase() {
    console.log(`Getting database:\n${config.database.id}\n`)
    return new Promise((resolve, reject) => {
      this._client.readDatabase(this._databaseUrl, (err, result) => {
        if(err) {
          reject(err)
        }
        else {
          resolve(result)
        }
      })
    })
  }

  saveDocument(document) {
    return new Promise((resolve, reject) => {
      this._client.createDocument(this._collectionUrl, document, (err, created) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(created)
        }
      })
    })
  }
}
//https://docs.microsoft.com/en-us/azure/cosmos-db/sql-api-nodejs-get-started
