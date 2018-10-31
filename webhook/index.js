const line = require('@line/bot-sdk')
const TextResponse = require('./text-response')
const AudioResponse = require('./audio-response')
const FileResponse = require('./file-response')
const FeedbackResponse = require('./feedback-response')
const Util = require('./Util')
const util = new Util()

const config = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}
const client = new line.Client(config)

module.exports = async function (context, req) {
  const fileRes = new FileResponse(client, context, process.env.IS_DEBUG)
  const audioRes = new AudioResponse(client, context, process.env.IS_DEBUG)
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
    await Promise.all(req.body.events.map(handleEvent))
    context.res = {
      body: 'Hello Function'
    }
    context.done()
  }

  async function handleEvent(event) {
    if (event.type === 'message') {
      if (event.message.type === 'text') {
        const textRes = new TextResponse(client, context, false)
        await textRes.init()
        await textRes.replyMessage(event)
        return
      }
      else if (event.message.type === 'audio') {
        // process
        context.log('start audio processing')
        await audioRes.replyMessage(event.replyToken, event.message)
        return
        //TODO save audio to blob storage
      }
      else if (event.message.type == 'file') {
        await fileRes.replyMessage(event.replyToken, event.message)
        return
      }
    }
    else if (event.type === 'postback') {
      const feedRes = new FeedbackResponse(client, context, false)
      await feedRes.init()
      await feedRes.replyMessage(event)
      return
    }
    var reply = util.generateTextMessage('子育てに関して、知りたいことやお子さんの鳴き声を入力してください。')
    await client.replyMessage(event.replyToken, reply)
    return
  }
}
