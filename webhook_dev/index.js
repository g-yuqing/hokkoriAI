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
    else if(type === 'age') {
      info.gender = true
      context.log('audioReply-age:', info)
      reply = {
        type: 'template',
        altText: 'birthday pickers alt text',
        template: {
          type: 'buttons',
          text: '赤ちゃんの誕生日を選んでください',
          actions: [
            // { type: 'datetimepicker', label: 'date', data: 'BIRTH', mode: 'date'}
            { type: 'postback', label: '０ヶ月~６ヶ月', data: '0-6', text: '０ヶ月~６ヶ月' },
            { type: 'postback', label: '６ヶ月~１歳', data: '6-12', text: '６ヶ月~１歳' },
            { type: 'postback', label: '１歳~２歳', data: '12-24', text: '１歳~２歳' }
          ],
        },
      }
    }
    else if(type === 'confirm') {
      info.age = true
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
    else if(data === '0-6' || data === '6-12' || data === '12-24' || data === '24-48' || data === '48-0') {
      info.data.age = data
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
    else if (data === 'YES') {
      if(info.gender && info.age) {
        // upload
        uploadAudio(event, info)
        // init info
        info.gender = false
        info.age = false
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
