const axios = require('axios')
const Util = require('./Util')
const util = new Util()
const CosmosDbLog = require('./cosmosdb/log')

class TextResponse {
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
    var replyToken = lineEvent.replyToken
    var messageText = lineEvent.message.text
    if (this.isDebug == false) {
      this.context.log('TextResponse: send messages to QnA Maker Service')
      const
        url = 'https://hokkoriai-qna.azurewebsites.net/qnamaker/knowledgebases/7a05a644-aacc-4177-b3af-73f3d249fe8f/generateAnswer',
        data = { question: messageText },
        config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'EndpointKey 0c088b78-4811-4565-b452-d121ae9075b1'
          },
        }
      try {
        const res = await axios.post(url, data, config)
        var reply = []
        if (res.data.answers[0].score > 50) {
          if (res.data.answers[0].score < 75) {
            reply.push(util.generateTextMessage('お役に立てるか分かりませんが、こちらの回答はいかがでしょうか？'))
          }
          reply.push(util.generateTextMessage(res.data.answers[0].answer))
          reply.push(this.generateFeedBackForm(lineEvent.message.id))
          await this.dbLog.addItem({ 'id': lineEvent.message.id, 'body': lineEvent, 'answer': res.data.answers[0], 'feedback': '' })
        } else {
          reply.push(util.generateTextMessage('すいません、分かりませんでした。別の言葉に言い換えていただけますか？'))
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
