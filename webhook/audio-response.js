const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

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
            'Content-Type': 'multipart/form-data'
          },
        },
        downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a')
      this.downloadAudio(message.id, downloadPath)
        .then(() => {
          this.context.log('audio saved')
          return 'ok'
        })
      // this.client.getMessageContent(message.id)
      //   .then(stream => {
      //     this.context.log('content of stream')
      //     let data = new FormData()
      //     data.append('audio', stream)
      //     this.context.log(data)
      //     axios.post(url, data, config)
      //       .then(res => {
      //         this.context.log(res)
      //       })
      //   })
      //   .catch(err => {this.context.log(`axios post error: ${err}`)})
    }
    else {
      return Promise.resolve(null)
    }
  }
  downloadAudio(messageId, downloadPath) {
    return this.client.getMessageContent(messageId)
      .then(stream => new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath)
        stream.pipe(writable)
        stream.on('end', () => resolve(downloadPath))
        stream.on('error', reject)
      }))
  }
}
