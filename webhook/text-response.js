const axios = require('axios')

module.exports = class TextResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, messages) {
    if(this.isDebug == 'false') {
      this.context.log(`replyToken: ${replyToken}`)
      this.context.log(messages)
      this.context.log('send messages to 3rd server')
      // request to thrid server
      const url = `https://yuqingguan.top/text/${messages.text}`
      this.context.log(`3rd server url: ${url}`)
      axios.get(url)
        .then(res => {
          const reply = res.data
          this.context.log(`response from 3rd server: ${reply}`)
          return this.client.replyMessage(replyToken, reply)
        })
      // return this.client.replyMessage(replyToken, messages)
    }
    else {
      return Promise.resolve(null)
    }
  }
}
