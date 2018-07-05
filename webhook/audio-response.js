const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

module.exports = class AudioResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, message) {
    if(this.isDebug == 'false') {
      this.context.log('AudioResponse: send messages to 3rd server')
      const url = 'https://yuqingguan.top/audio',
        config = {
          headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'multipart/form-data'
          },
        }
      this.context.log('message information: ')
      this.context.log(message)
      this.client.getMessageContent(message.id)
        // .then(stream => {
        //   this.context.log('content of stream')
        //   let data = new FormData()
        //   data.append('audio', stream)
        //   axios.post(url, data, config)
        //     .then(res => {
        //       this.context.log(res)
        //     })
        // })
        // .catch(err => {this.context.log(`axios post error: ${err}`)})
        .then(stream => new Promise((resolve, reject) => {
          // const writable = fs.createWriteStream()
        }))
    }
    else {
      return Promise.resolve(null)
    }
  }
}
