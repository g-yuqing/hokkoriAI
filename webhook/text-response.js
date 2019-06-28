const axios = require('axios')
const Util = require('./_Util')
const util = new Util()
const CosmosDbLog = require('./cosmosdb/log')
const QnaMaker = require('./qnamaker/QnaMaker')
const Eliza = require('./Eliza/Eliza')
const UserLog = require('./cosmosdb/UserLog')

class TextResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
    this.dbLog = new CosmosDbLog(this.context)
    this.dbLog.init()
  }

  async init() {
    await this.dbLog.init()
  }

  async replyMessage(lineEvent) {
    var replyToken = lineEvent.replyToken
    var messageText = lineEvent.message.text
    if (this.isDebug == false) {
      this.context.log('TextResponse: send messages to QnA Maker Service')
      try {
        this.qnaMaker = new QnaMaker(this.context)
        const res = await this.qnaMaker.GetQnaAnswer(messageText)
        var reply = []
        if (res.data.answers[0].score > 65) {
          reply.push(util.generateTextMessage(res.data.answers[0].answer))
          reply.push(this.generateFeedBackForm(lineEvent.message.id))
          await this.dbLog.addItem({ 'id': lineEvent.message.id, 'body': lineEvent, 'answer': res.data.answers[0], 'feedback': '' })
        } else {
          this.eliza = new Eliza(this.context)
          const elizaRes = await this.eliza.GetAnswer(messageText)
          this.context.log(elizaRes.data);
          reply.push(util.generateTextMessage(elizaRes.data));
          await this.dbLog.addItem({ 'id': lineEvent.message.id, 'body': lineEvent, 'answer': '', 'feedback': 'bad' })
        }
        await this.client.replyMessage(replyToken, reply)
      } catch (err) {
        this.context.log(`axios post error: ${err}`)
      }
    }
    else {
      return this.client.replyMessage(replyToken, util.generateTextMessage('Debug mode'))
    }
  }

  generateFeedBackForm(id) {
    return { type: 'template', altText: 'フィードバックフォーム', template: { type: 'buttons', title: 'フィードバックお願いします', text: 'この回答は役に立ちましたか？', actions: [{ type: 'postback', label: 'はい', data: `{"result": ${true}, "id": "${id}"}`, displayText: 'はい' }, { type: 'postback', label: 'いいえ', data: `{"result": ${false}, "id": "${id}"}`, displayText: 'いいえ' }] } }
  }
}
module.exports = TextResponse
