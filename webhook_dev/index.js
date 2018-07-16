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
      case 'text':
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '音声で入力してみてください'
        })
      case 'audio':
        return audioReply(event)
      default:
        return
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

  function audioReply(event) {
    const reply = {
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
    return client.replyMessage(event.replyToken, reply)
  }
  function audioPostback(event) {
    let data = event.postback.data
    context.log(data)
  }
}
