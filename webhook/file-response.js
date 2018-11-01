const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
require('tls').DEFAULT_ECDH_CURVE = 'auto'

class FileResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }

  async replyMessage(replyToken, message) {
    const ext = path.extname(message.fileName)
    if (this.isDebug === 'false' && (ext === '.m4a' || ext === '.wav' || ext === '.mp3')) {
      const downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a'),
        url = 'https://yuqingguan.top/audio'

      try {
        await this.downloadAudio(message.id, downloadPath)
        this.context.log('AudioResponse: file saved, send messages to 3rd server')
        const form = new FormData()
        form.append('file', fs.createReadStream(downloadPath))
        const config = {
          headers: form.getHeaders()
        }

        const res = await axios.post(url, form, config)
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
        await this.client.replyMessage(replyToken, reply)
        return
      } catch (err) {
        this.context.log(`axios post error: ${err}`)
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

module.exports = FileResponse