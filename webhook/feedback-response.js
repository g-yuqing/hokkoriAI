const Util = require('./Util')
const util = new Util()
const CosmosDbLog = require('./cosmosdb/log')

class FeedbackResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
    this.dbLog = new CosmosDbLog(this.context)
  }

  async init() {
    await this.dbLog.init()
  }

  async replyMessage(lineEvent) {
    this.context.log('Begin FeedBack response')
    var reply = []
    var replyToken = lineEvent.replyToken
    var data = JSON.parse(lineEvent.postback.data)
    var items = await this.dbLog.findById(data.id)
    if ((items.length != 0) && (items[0].feedback == '')) {
      reply.push(util.generateTextMessage('フィードバックありがとうございます。'))
      await this.dbLog.updateFeedback(data.id, (data.result == true) ? 'good' : 'bad')
    } else {
      reply.push(util.generateTextMessage('既にフィードバックが登録済みです。'))
    }

    reply.push(util.generateTextMessage('子育てに関して、知りたいことやお子さんの鳴き声を入力してください。'))
    return await this.client.replyMessage(replyToken, reply)
  }
}
module.exports = FeedbackResponse