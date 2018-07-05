const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const request = require('request')

module.exports = class AudioResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, message) {
    if(this.isDebug == 'false') {
      const url = 'https://yuqingguan.top/audio',
        downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a')
      this.downloadAudio(message.id, downloadPath)
        .then(() => {
          this.context.log('AudioResponse: send messages to 3rd server')
          const data = new FormData()
          data.append('file', fs.createReadStream(downloadPath))
          // data.append('audio', fs.createReadStream(path.join(__dirname, 'tempfile', 'sample.m4a')))
          const options = {
            url: url,
            method: 'POST',
            headers: data.getHeaders(),
            formData: data
          }
          request(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
              this.context.log(body)
            }
            else {
              this.context.log(`upload error: ${err}`)
            }
          })
        })
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
