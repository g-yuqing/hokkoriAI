const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
  };
const BotFacade = require('./bot-facade.js');
const client = new line.Client(config);
const CosmosDbLog = require('./cosmosdb/log');
const log = new CosmosDbLog();
log.getDatabase()
    .then(() => { console.log(`CosmosDb connected successfully`); })
    .catch((error) => { console.log(`CosmosDb connected with error ${JSON.stringify(error)}`) });

module.exports = function (context, req) {
    const facade = new BotFacade(client, context, process.env.IS_DEBUG);
    context.log('JavaScript HTTP trigger function processed a request.');
    if (!req.body || !req.body.events) {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
        context.done();
    } else {
        context.log(req.body.events);
        Promise
            .all(req.body.events.map(handleEvent))
            .then((result) => {
                context.res = {
                    body: "Hello Function"
                };
                return context.done();
            });
    }
    
    function handleEvent(event) {
        const saveDoc = log.saveDocument({
            "id": event.message.id,
            "body": event
        })
        .then(() => { console.log(`CosmosDb saved successfully`); })
        .catch((error) => { console.log(`CosmosDb saved with error ${JSON.stringify(error)}`) });
        if (event.type === 'message') {
            if (event.message.type === 'text') {
                const reply = facade.replyMessage(event.replyToken, {
                    type: 'text',
                    text: event.message.text
                });
                return Promise.all([saveDoc, reply]);
            } else if (event.message.type === 'video') {
                //TODO 動画保存
                return saveDoc;
            }
        } 
        return saveDoc;
    }
};
