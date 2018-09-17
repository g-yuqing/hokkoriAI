const line = require('@line/bot-sdk')
const storage = require('azure-storage')
const path = require('path')
const fs = require('fs')



const client = new line.Client({
  channelAccessToken: process.env.ACCESS_TOKEN_DEV,
  channelSecret: process.env.CHANNEL_SECRET_DEV
})
const connectStr = process.env.BLOB_CONNECTION_STRING
const blobService = storage.createBlobService(connectStr)
let info = {
  gender: false,
  age: false,
  file: false,
  data: {},
}

module.exports = function(context, req) {
  context.log('JavaScript HTTP trigger function processed a request.')
  if (!req.body || !req.body.events) {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    }
    context.done()
  }
  else {
    context.log(req.body.events)
    Promise.all(req.body.events.map(handleEvent))
      .then(() => {
        context.res = {
          body: 'Hello Function'
        }
        return context.done()
      })
  }
  function handleEvent(event) {
    if(event.type === 'message') {
      if(event.message.type === 'audio') {
        // init info
        info.gender = false
        info.age = false
        info.file = false
        info.data = {}
        const downloadPath = path.join(__dirname, 'tempfile', `${event.source.userId}.m4a`)
        downloadAudio(event.message.id, downloadPath)
        context.log('init state: ', info)
        return audioReply(event, 'gender')
      }
      else {
        return Promise.resolve(null)
      }
    }
    else if(event.type === 'postback') {
      return audioPostback(event)
    }
    else {
      return Promise.resolve(null)
    }
  }
  function audioReply(event, type) {
    let reply = {}
    if(type === 'gender') {
      info.file = true
      if(info.file) {
        reply = {
          type: 'template',
          altText: 'gender pickers alt text',
          template: {
            type: 'buttons',
            text: '赤ちゃんの性別を選んでください',
            actions: [
              { type: 'postback', label: '男の子', data: 'MALE', text: '男の子' },
              { type: 'postback', label: '女の子', data: 'FEMALE', text: '女の子' }
            ],
          },
        }
      }
      else {
        reply = {
          type: 'text',
          text: 'すみません、最初から話をかけてください！'
        }
      }
    }
    else if(type === 'age') {
      info.gender = true
      if(info.file && info.gender) {
        reply = {
          type: 'template',
          altText: 'birthday pickers alt text',
          template: {
            type: 'buttons',
            text: '赤ちゃんの誕生日を選んでください',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'BIRTH', mode: 'date'}
            ],
          },
        }
      }
      else {
        reply = {
          type: 'text',
          text: 'すみません、最初から話をかけてください！'
        }
      }
    }
    else if(type === 'confirm') {
      info.age = true
      if(info.file && info.gender && info.age) {
        reply = {
          type: 'template',
          altText: 'confirm alt text',
          template: {
            type: 'buttons',
            text: '確認',
            actions: [
              { type: 'postback', label: 'はい', text: 'はい!', data: 'YES' },
              { type: 'postback', label: 'いいえ', text: 'いいえ!', data: 'NO' },
              { type: 'postback', label: 'やめる', text: 'やめる!', data: 'DISCARD' },
            ],
          },
        }
      }
      else {
        reply = {
          type: 'text',
          text: 'すみません、最初から話をかけてください！'
        }
      }
    }
    else {
      reply = {}
    }
    return client.replyMessage(event.replyToken, reply)
  }
  function audioPostback(event) {
    const data = event.postback.data
    if(data === 'MALE' || data === 'FEMALE') {
      info.data.gender = data
      return audioReply(event, 'age')
    }
    else if(data === 'BIRTH') {
      const birthdayStr = JSON.stringify(event.postback.params).date
      //calculate age
      const birthday = new Date(birthdayStr),
        today = new Date()
      let diff =(today.getTime() - birthday.getTime()) / 1000
      diff /= (60 * 60 * 24 * 7 * 4)
      info.data.age = Math.abs(Math.round(diff))
      return audioReply(event, 'confirm')
    }
    else if(data === 'NO') {
      return audioReply(event, 'gender')
    }
    else if(data === 'DISCARD') {
      return client.replyMessage(
        event.replyToken, {
          type: 'text',
          text: 'データの保存をやめました、ありがとうございます'
        }
      )
    }
    else if(data === 'YES') {
      context.log('in Yes')
      if(info.gender && info.age) {
        // upload
        context.log('upload')
        uploadAudio(event, info)
        // reset info
        info.gender = false
        info.age = false
        info.file = false
        info.data = {}
        // remove temporary file
        const sourceFilePath = path.join(__dirname, 'tempfile', `${event.source.userId}.m4a`)
        fs.unlink(sourceFilePath, err => {
          if(err) {
            context.log(err)
          }
          context.log('temporary file deleted')
        })
        return client.replyMessage(
          event.replyToken, {
            type: 'text',
            text: 'データを保存しました、ありがとうございます！'
          }
        )
      }
      else {
        return client.replyMessage(
          event.replyToken, {
            type: 'text',
            text: 'すみません、最初から話をかけてください！'
          }
        )
      }
    }
    else {
      return
    }
  }
  function uploadAudio(event, info) {
    context.log('in upload func')
    const blobName = `${info.data.gender}_${info.data.age}_${event.source.userId}_${event.timestamp}.m4a`
    const sourceFilePath = path.join(__dirname, 'tempfile', `${event.source.userId}.m4a`)
    const containerName = 'audio'
    // upload
    return new Promise((resolve, reject) => {
      blobService.createBlockBlobFromLocalFile(containerName, blobName, sourceFilePath, err => {
        if(err) {
          reject(err)
        }
        else {
          resolve({ message: `Upload of '${blobName}' complete` })
        }
      })
    })
  }
  function downloadAudio(messageId, downloadPath) {
    return client.getMessageContent(messageId)
      .then(stream => new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath)
        stream.pipe(writable)
        stream.on('end', () => resolve(downloadPath))
        stream.on('error', reject)
      }))
  }
}
