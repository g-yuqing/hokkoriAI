const axios = require('axios')

module.exports = class AudioResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, message) {
    if(this.isDebug == 'false') {
      this.context.log('AudioResponse: send messages to 3rd server')
      const url = 'https://yuqingguan.top/audio/',
        data = {question: message.text},
        config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'EndpointKey 0c088b78-4811-4565-b452-d121ae9075b1'
          },
        }
      this.client.getMessageContent(message.id)
        .then(stream => {
          this.context.log('content of stream')
          axios.post(url, stream, config)
            .then(res => {
              this.context.log(res)
            })
        })
    }
    else {
      return Promise.resolve(null)
    }
  }
}
