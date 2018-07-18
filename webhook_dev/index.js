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
        const downloadPath = path.join(__dirname, 'tempfile', `${event.message.id}.m4a`)
        downloadAudio(event.message.id, downloadPath)
        return audioReply(event, 'label')
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
    if(type === 'label') {
      reply = {
        type: 'template',
        altText: 'label pickers alt text',
        template: {
          type: 'buttons',
          text: '泣きの原因を選んでください',
          actions: [
            { type: 'postback', label: '特に理由なし', data: 'FUSSY', text: '特に理由なし' },
            { type: 'postback', label: 'お腹が空いてる', data: 'HUNGRY', text: 'お腹が空いてる' },
            { type: 'postback', label: 'どこか痛くしてる', data: 'PAIN', text: 'どこか痛くしてる' },
            { type: 'postback', label: 'そのほか', data: 'OTHER', text: 'そのほか' }
          ],
        },
      }
    }
    else if(type === 'confirm') {
      const params = event.postback.params
      reply = {
        type: 'template',
        altText: 'confirm alt text',
        template: {
          type: 'buttons',
          text: `${params}`,
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
    if(data === 'FUSSY' || data === 'HUNGRY' || data === 'PAIN' || data === 'OTHER') {
      return audioReply(event, 'confirm')
    }
    else if (data === 'NO') {
      return audioReply(event, 'label')
    }
    else if (data === 'DISCARD') {
      return client.replyMessage(
        event.replyToken, {
          type: 'text',
          text: 'データの保存をやめました、ありがとうございます'
        }
      )
    }
    else if (data === 'YES') {
      return client.replyMessage(
        event.replyToken, {
          type: 'text',
          text: 'データを保存しました、ありがとうございます！'
        }
      )
    }
    else {
      return
    }
  }
  function audioUpload(event, label) {
    const blobName = `${label}_${event.source.userId}.m4a`
    const sourceFilePath = path.join(__dirname, 'tempfile', `${event.message.id}.m4a`)
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
