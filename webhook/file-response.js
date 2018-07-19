const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

module.exports = class FileResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, message) {
    const ext = path.extname(message.fileName)
    if(this.isDebug === 'false' && (ext === '.m4a' || ext === '.wav' || ext === '.mp3')) {
      const downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a'),
        url = 'https://yuqingguan.top/audio'
      this.downloadAudio(message.id, downloadPath)
        .then(() => {
          this.context.log('AudioResponse: file saved, send messages to 3rd server')
          const form = new FormData()
          form.append('file', fs.createReadStream(downloadPath))
          const config = {
            headers: form.getHeaders()
          }
          axios.post(url, form, config)
            .then(res => {
              const replyText = {
                fussy: '泣きの理由がなさそうです',
                hungry: 'お腹が空いてるようです',
                pain: '痛みを感じているようです'
              }
              let reply = {
                type: 'text',
                text: ''
              }
              const obj = res.data
              const key = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
              reply.text = replyText[key]
              return this.client.replyMessage(replyToken, reply)
            })
            .catch(err => {this.context.log(`axios post error: ${err}`)})
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
