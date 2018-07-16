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
        return audioReply(event, 'birth')
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
    // if (event.type === 'message') {
    //   if (event.message.type === 'text') {
    //     const reply = {
    //       type: 'template',
    //       altText: 'Confirm alt text',
    //       template: {
    //         type: 'confirm',
    //         text: event.message.text,
    //         actions: [
    //           { label: 'Yes', type: 'message', text: 'Yes!' },
    //           { label: 'No', type: 'message', text: 'No!' },
    //         ],
    //       },
    //     }
    //     context.log(reply)
    //     return client.replyMessage(event.replyToken, reply)
    //   }
    //   else if(event.message.type === 'audio') {
    //     return Promise.resolve(null)
    //     // // process
    //     // context.log('start audio processing')
    //     // const reply = audioRes.replyMessage(event.replyToken, event.message)
    //     // return Promise.all([reply])
    //     // //TODO save audio to blob storage
    //   }
    // }
    // else {
    //   return Promise.resolve(null)
    // }
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
            { type: 'message', label: '特に理由なし', data: 'FUSSY' },
            { type: 'message', label: 'お腹が空いてる', data: 'HUNGRY' },
            { type: 'message', label: 'どこか痛くしてる', data: 'PAIN' },
            { type: 'message', label: 'そのほか', data: 'OTHER' }
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
      const params = JSON.stringify(event.postback.params)
      reply = {
        type: 'template',
        altText: 'confirm alt text',
        template: {
          type: 'confirm',
          text: `${params}`,
          actions: [
            { label: 'Yes', type: 'message', text: 'はい!', data: 'YES' },
            { label: 'No', type: 'message', text: 'いいえ!', data: 'NO' },
            { label: 'DISCARD', type: 'message', text: 'やめる!', data: 'DISCARD' },
          ],
        },
      }
    }
    else {
      reply = {}
    }
    context.log(`===reply===: ${reply}`)
    return client.replyMessage(event.replyToken, reply)
  }
  function audioPostback(event) {
    const data = event.postback.data
    if(data === 'FUSSY' || data === 'HUNGRY' || data === 'PAIN' || data === 'OTHER') {
      return audioReply(event, 'birth')
    }
    else if (data === 'DATE') {
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
