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
      const url = 'https://yuqingguan.top/audio/'
      this.client.getMessageContent(message.id)
        .then(stream => {
          this.context.log('content of stream')
          axios.post(url, stream)
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
