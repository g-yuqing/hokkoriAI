import axios from 'axios'

export default class TextResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, messages) {
    if(this.isDebug == 'false') {
      this.context.log(`replyToken: ${replyToken}`)
      this.context.log(messages)
      // // request to thrid server
      // const url = `https://yuqingguan.top/text/${messages.text}`
      // axios.get(url)
      //   .then(res => {
      //     const reply = res.data
      //     return this.client.replyMessage(replyToken, reply)
      //   })
      return this.client.replyMessage(replyToken, messages)
    }
    else {
      return Promise.resolve(null)
    }
  }
}
