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
      this.client.getMessageContent(message.id)
        .then(stream => {
          let data = new FormData()
          let chunckCount = 0
          stream.on('data', chunck => {
            data.append(`buffer${chunckCount}`, chunck)
            chunckCount += 1
            this.context.log(`in: ${chunckCount}`)
            // this.context.log(typeof(chunck))
            // this.context.log(chunck)
          })
          stream.on('error', err => {
            this.context.log(err)
          })
          this.context.log(chunckCount)
          this.context.log(data)
        })
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
    }
    else {
      return Promise.resolve(null)
    }
  }
}
