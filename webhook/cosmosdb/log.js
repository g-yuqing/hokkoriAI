'use strict'
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require('./config')

class CosmosDbLog {
  constructor(context) {
    this._cosmosClient = new CosmosClient({ endpoint: config.endpoint, auth: { 'masterKey': config.cosmosDbKey } })
    this._databaseId = config.database.id
    this._collectionId = config.collection.id
    this._database = null
    this._container = null
    this.context = context
  }

  async init() {
    try {
      const { dbResponse } = await this._cosmosClient.databases.createIfNotExists({ id: this._databaseId });
      this._database = dbResponse
      this.context.log(config.endpoint)
      this.context.log(config.cosmosDbKey)
      const { container } = await this._cosmosClient.database(this._databaseId).containers.createIfNotExists({ id: this._collectionId })
      this._container = container
    } catch (err) {
      this.context.log('Something happen on the logger database init')
      this.context.log(err)
    }
  }

  async addItem(item) {
    const { body: doc } = await this._container.items.upsert(item)
    return doc
  }

  async upsertUserLog(log) {
    const {body: doc} = await this._container.items.upsert(log)
    return doc
  }

  async updateUserLog(log) {
    const {body: doc} = await this._container.items.up
  }

  async findUserLogByIdIn30Min(id) {
    const findTimeStampUntil = Date.now() - 1800; // 30分前から取得

    try {
      const querySpec = {
        query: "SELECT * FROM root r WHERE r.userId=@id and r.updateAt>@findTimeStampUntil",
        parameters: [
          {
            name: "@id",
            value: id
          },
          {
            name: "@findTimeStampUntil",
            value: findTimeStampUntil
          }
        ]
      }

      const { result: results } = await this._container.items.query(querySpec).toArray()
      return results
    } catch (err) {
      this.context.log('Find item from database was failed with the error below')
      this.context.log(err)
    }
  }

  async findById(id) {
    try {
      const querySpec = {
        query: "SELECT * FROM root r WHERE r.id=@id",
        parameters: [
          {
            name: "@id",
            value: id
          }
        ]
      }

      const { result: results } = await this._container.items.query(querySpec).toArray()
      return results
    } catch (err) {
      this.context.log('Find item from database was failed with the error below')
      this.context.log(err)
    }
  }

  async updateFeedback(id, fbResult) {
    try {
      this.context.log(id)
      const doc = await this.findById(id)
      if (doc.length == 0) {
        this.context.log('Cannot find an item by id')
        return
      }
      doc[0].feedback = fbResult
      const { body: result } = await this._container.item(id).replace(doc[0])
      return result
    } catch (err) {
      this.context.log('Update feedback from itemId was failed with the error below')
      this.context.log(err)
    }
  }
}
module.exports = CosmosDbLog