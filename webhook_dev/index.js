// const line = require('@line/bot-sdk');
// const config = {
//     channelAccessToken: process.env.ACCESS_TOKEN_DEV,
//     channelSecret: process.env.CHANNEL_SECRET_DEV
//   };
// const BotFacade = require('./bot-facade.js');
// const client = new line.Client(config);
// const CosmosDbLog = require('./cosmosdb/log');
// const log = new CosmosDbLog();
// log.getDatabase()
//     .then(() => { console.log(`CosmosDb connected successfully`); })
//     .catch((error) => { console.log(`CosmosDb connected with error ${JSON.stringify(error)}`) });
//
// module.exports = function (context, req) {
//     const facade = new BotFacade(client, context, process.env.IS_DEBUG);
//     context.log('JavaScript HTTP trigger function processed a request.');
//     if (!req.body || !req.body.events) {
//         context.res = {
//             status: 400,
//             body: "Please pass a name on the query string or in the request body"
//         };
//         context.done();
//     } else {
//         context.log(req.body.events);
//         Promise
//             .all(req.body.events.map(handleEvent))
//             .then((result) => {
//                 context.res = {
//                     body: "Hello Function"
//                 };
//                 return context.done();
//             });
//     }
//
//     function handleEvent(event) {
//         const saveDoc = log.saveDocument({
//             "id": event.message.id,
//             "body": event
//         })
//         .then(() => { console.log(`CosmosDb saved successfully`); })
//         .catch((error) => { console.log(`CosmosDb saved with error ${JSON.stringify(error)}`) });
//         if (event.type === 'message') {
//             if (event.message.type === 'text') {
//                 const reply = facade.replyMessage(event.replyToken, {
//                     type: 'text',
//                     text: event.message.text
//                 });
//                 return Promise.all([saveDoc, reply]);
//             } else if (event.message.type === 'video') {
//                 //TODO 動画保存
//                 return saveDoc;
//             }
//         }
//         return saveDoc;
//     }
// };

const line = require('@line/bot-sdk')
const CosmosDbLog = require('./cosmosdb/log')
const TextResponse = require('./text-response')
const AudioResponse = require('./audio-response')


const config = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}
const client = new line.Client(config)
const dbLog = new CosmosDbLog()
dbLog.getDatabase()
  .then(() => {console.log('CosmosDb connected successfully')})
  .catch(error => {console.log(`CosmosDb connected with error ${JSON.stringify(error)}`)})

module.exports = function(context, req) {
  const textRes = new TextResponse(client, context, process.env.IS_DEBUG)
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
    Promise.all(req.body.events.map(handleEvent))
      .then(() => {
        context.res = {
          body: 'Hello Function'
        }
        return context.done()
      })
  }

  function handleEvent(event) {
    if (event.type === 'message') {
      if (event.message.type === 'text') {
        // // process
        // const reply = textRes.replyMessage(event.replyToken, {
        //   type: 'text',
        //   text: event.message.text
        // })
        // // save text to cosmosdb
        // const saveDoc = dbLog.saveDocument({'id': event.message.id, 'body': event})
        //   .then(() => {console.log('CosmosDb saved successfully')})
        //   .catch(error => {console.log(`CosmosDb saved with error ${JSON.stringify(error)}`)})
        // return Promise.all([saveDoc, reply])
        const replyContent = {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
              { label: 'Say message', type: 'message', text: 'Rice=米' },
            ],
          },
        }
        return client.replyText(event.replyToken, replyContent)
      }
      else if(event.message.type === 'audio') {
        // // process
        // context.log('start audio processing')
        // const reply = audioRes.replyMessage(event.replyToken, event.message)
        // return Promise.all([reply])
        // //TODO save audio to blob storage
      }
    }
    else {
      return Promise.resolve(null)
    }
  }
}
