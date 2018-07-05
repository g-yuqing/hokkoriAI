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
      const url = 'https://yuqingguan.top/audio',
        config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        },
        downloadPath = path.join(__dirname, 'tempfile', 'audio.wav')
      this.downloadAudio(message.id, downloadPath)
        .then(() => {
          this.context.log('AudioResponse: send messages to 3rd server')
          const data = new FormData()
          data.append('audio', fs.createReadStream(downloadPath))
          this.client.getMessageContent(message.id)
            .then(stream => {
              this.context.log('===========', stream == fs.createReadStream(downloadPath))
            })
          this.context.log(data)
          axios.post(url, data, config)
            .then(res => {
              this.context.log(res)
              this.context.log('reply audio response')
              const getDuration = require('get-audio-duration')
              let audioDuration
              getDuration(downloadPath)
                .then(duration => {audioDuration = duration})
                .catch(() => {audioDuration = 1})
                .finally(() => {
                  return this.client.replyMessage(replyToken, {
                    type: 'audio',
                    originalContentUrl: `${process.env.BASE_URL}/tempfile/${path.basename(downloadPath)}`,
                    duration: audioDuration*1000
                  })
                })
            })
        })
        .catch(err => {this.context.log(`axios post error: ${err}`)})
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
