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
    if (event.type === 'message') {
      if (event.message.type === 'text') {
        const reply = {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: event.message.text,
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
        context.log(reply)
        return client.replyMessage(event.replyToken, reply)
      }
      else if(event.message.type === 'audio') {
        return Promise.resolve(null)
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
