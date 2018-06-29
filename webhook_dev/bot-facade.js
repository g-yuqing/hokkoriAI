module.exports = class BotFacade {

    constructor (lineClient, context, isDebug) {
        this.client = lineClient;
        this.context = context;
        this.isDebug = isDebug;
    }

    replyMessage(replyToken, messages) {
        if (this.isDebug == 'false') {
            this.context.log("replyToken:" + replyToken);
            this.context.log(messages);
            return this.client.replyMessage(replyToken, messages);
        } else {
            return Promise.resolve(null);
        }
    }
}