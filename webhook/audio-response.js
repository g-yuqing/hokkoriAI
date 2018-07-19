const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const axios = require('axios')


module.exports = class AudioResponse {
  constructor(lineClient, context, isDebug) {
    this.client = lineClient
    this.context = context
    this.isDebug = isDebug
  }
  replyMessage(replyToken, message) {
    if(this.isDebug == 'false') {
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
              // for(const key in res.data) {
              //   if(res.data[key] == 1) {
              //     reply.text = replyText[key]
              //   }
              //   break
              // }
              const obj = res.data
              const key = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)
              reply.text = replyText[key]
              return this.client.replyMessage(replyToken, reply)
            })
            .catch(err => {this.context.log(`axios post error: ${err}`)})
          // const formData = {
          //   'file': fs.createReadStream(downloadPath),
          //   // 'timeout': 180000
          // }
          // this.context.log('init over')
          // request.post({url: url, formData: formData}, function(err, res, body) {
          //   this.context.log('working?')
          //   this.context.log(body)
          //   if (!err && res.statusCode == 200) {
          //     this.context.log('body')
          //     this.context.log(body)
          //     this.context.log(body.fussy, body.hungry, body.pain)
          //     this.context.log('res')
          //     this.context.log(res)
          //     const reply = {
          //       type: 'text',
          //       text: 'processed'
          //     }
          //     return this.client.replyMessage(replyToken, reply)
          //   }
          //   else {
          //     this.context.log('error')
          //     this.context.log(`upload error: ${err}`)
          //     const reply = {
          //       type: 'text',
          //       text: 'error happened'
          //     }
          //     return this.client.replyMessage(replyToken, reply)
          //   }
          // })
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
