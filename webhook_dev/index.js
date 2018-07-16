const line = require('@line/bot-sdk')
// const AudioResponse = require('./audio-response')


const config = {
  channelAccessToken: process.env.ACCESS_TOKEN_DEV,
  channelSecret: process.env.CHANNEL_SECRET_DEV
}
const client = new line.Client(config)

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
    switch(event.type) {
    case 'message':
      switch(event.message.type) {
      case 'audio':
        return audioReply(event, 'label')
      default:
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '音声で入力してみてください'
        })
      }
    case 'postback':
      return audioPostback(event)
    default:
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
    else if(type === 'birth') {
      reply = {
        type: 'template',
        altText: 'date pickers alt text',
        template: {
          type: 'buttons',
          text: '赤ちゃんの誕生日を選んでください',
          actions: [
            { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' }
          ],
        },
      }
    }
    else if(type === 'confirm') {
      // const params = JSON.stringify(event.postback.params)
      reply = {
        type: 'template',
        altText: 'confirm alt text',
        template: {
          type: 'confirm',
          text: '===confirm===',
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
      return audioReply(event, 'birth')
    }
    else if (data === 'DATE') {
      context.log('==========date==========')
      return audioReply(event, 'confirm')
      // const temp = JSON.stringify(event.postback.params)
      // return client.replyMessage(event.replyToken, {
      //   type: 'text',
      //   text: `post content: ${temp}`
      // })
    }
    else if (data === 'NO') {
      return audioReply(event, 'birth')
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
          text: 'データを保存します、ありがとうございます！'
        }
      )
    }
    else {
      return
    }
  }
}
