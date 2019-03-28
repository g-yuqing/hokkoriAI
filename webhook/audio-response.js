const fs = require('fs')
const path = require('path')
const request = require('request-promise')
require('tls').DEFAULT_ECDH_CURVE = 'auto'

class AudioResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }

  async replyMessage(replyToken, message) {
    if (this.isDebug == 'false') {
      const downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a'),
        url = 'https://hokkoriaiv2.azurewebsites.net/api/audio?code=IVrbgLW1rSBVynREaNF0dc2X4O391/FobzDzAbJgA0kq6rm5nP/WvQ=='
      try {
        await this.downloadAudio(message.id, downloadPath)
        this.context.log('AudioResponse: file saved, send messages to 3rd server')
        var formData = {
          file: fs.createReadStream(downloadPath),
        };
        
        const res = await request({ url: `${url}`, formData: formData })
        this.context.log(res)
        const replyText = {
            fussy: '泣きの理由がなさそうです',
            hungry: 'お腹が空いてるようです',
            pain: '痛みを感じているようです'
        }
        let reply = {
            type: 'text',
            text: ''
        }
        const obj = JSON.parse(res)
        const key = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
        reply.text = replyText[key]
        await this.client.replyMessage(replyToken, reply)
        return
      } catch (err) {
          this.context.log(`post error: ${err}`)
      }
    }
    else {
      return
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
module.exports = AudioResponse
