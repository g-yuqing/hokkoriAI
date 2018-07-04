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
      // // request to thrid server
      // const url = `https://yuqingguan.top/text/${messages.text}`
      // axios.get(url)
      //   .then(res => {
      //     const replyText = res.data
      //     const reply = {
      //       type: 'text',
      //       text: replyText
      //     }
      //     return this.client.replyMessage(replyToken, reply)
      //   })
      // request to Auzre QnA Maker
      const url = 'https://hokkoriai-qna.azurewebsites.net/qnamaker/knowledgebases/7a05a644-aacc-4177-b3af-73f3d249fe8f/generateAnswer',
        data = {question: messages.text},
        config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'EndpointKey 0c088b78-4811-4565-b452-d121ae9075b1'
          },
        }
      axios.post(url, data, config)
        .then(res => {
          this.context.log('axios: successful.')
          this.context.log(res.data)
        })
        .catch(err => {this.context.log(`axios post error: ${err}`)})
    }
    else {
      return Promise.resolve(null)
    }
  }
}
