const axios = require('axios');
const Util = require('./Util');
const util = new Util();
const CosmosDbLog = require('./cosmosdb/log');
const QnaMaker = require('./qnamaker/QnaMaker');
const Eliza = require('./Eliza/Eliza');
const UserLog = require('./cosmosdb/UserLog');
const GerenalReply = require('./GeneralReply/GeneralReply');
const generalReply = new GerenalReply();

class MessageTextResponse {
    constructor(lineClient, context, isDebug) {
        this.client = lineClient
        this.context = context
        this.isDebug = isDebug
        this.dbLog = new CosmosDbLog(this.context)
    }

    async init() {
        await this.dbLog.init()
    }

    async replyMessage(lineEvent) {
        var replyToken = lineEvent.replyToken;
        try {
            var reply = [];
            let logState = await this.dbLog.findUserLogByIdIn30Min(lineEvent.source.userId);
            if (logState == undefined || logState.length == 0) {
                logState = new UserLog(lineEvent.message.id);
                logState.userId = lineEvent.source.userId;
            }
            logState.input.push(lineEvent.message.text)
            if (logState.questions.length == 0) {
                // QnA Maker で回答を試みる
                this.qnaMaker = new QnaMaker(this.context);
                const res = await this.qnaMaker.GetQnaAnswer(lineEvent.message.text);
                if (res.data.answers[0].score != 0) {
                    logState.questions = res.data.answers;
                    logState.updateAt = Date.now();
                    const qnaChoice = this.qnaMaker.GenerateSelection(res.data.answers);
                    reply.push(qnaChoice);
                    this.dbLog.upsertUserLog(logState);
                    return await this.client.replyMessage(replyToken, qnaChoice);
                } else {
                    //QnA Maker で回答できなかった
                    if (logState.input.length == 1) {
                        // 初回なのでELIZAで回答
                        this.eliza = new Eliza(this.context)
                        const elizaRes = await this.eliza.GetAnswer(lineEvent.message.text)
                        reply.push(util.generateTextMessage(elizaRes.data));
                        logState.answers.push(elizaRes.data);
                        logState.updateAt = Date.now();
                        this.dbLog.upsertUserLog(logState);
                        return await this.client.replyMessage(replyToken, reply);
                    } else {
                        // 2度目のメッセージなので、窓口案内
                        const announce = generalReply.GetFailureReply();
                        reply.push(util.generateTextMessage(announce));
                        logState.feedBack = 'bad';
                        logState.updateAt = Date.now();
                        this.dbLog.upsertUserLog(logState);
                        return await this.client.replyMessage(replyToken, reply);
                    }
                }
            } else {
                await this.client.replyMessage(replyToken, "なんでもない");
            }

        } catch (err) {
            this.context.log(`[MessageTextResponse] error: ${err}`);
            // 何かしらのエラーが発生したので、メッセージだけは返す。
            var reply = [];
            reply.push(util.generateTextMessage(new GerenalReply().GetErrorMessage()));
            await this.client.replyMessage(replyToken, reply);
        }
    }
}
module.exports = MessageTextResponse
