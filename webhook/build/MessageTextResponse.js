"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CosmosDbLog_1 = require("./cosmosdb/CosmosDbLog");
const Eliza_1 = require("./Eliza/Eliza");
const UserLog_1 = require("./cosmosdb/UserLog");
const QnaMaker_1 = require("./qnaMaker/QnaMaker");
const Util_1 = require("./Util");
const GeneralReply_1 = require("./GeneralReply/GeneralReply");
class MessageTextResponse {
    constructor(lineClient, context) {
        this.client = lineClient;
        this.context = context;
        this.dbLog = new CosmosDbLog_1.CosmosDbLog(this.context);
        this.qnaMaker = null;
        this.eliza = null;
    }
    async init() {
        await this.dbLog.init();
    }
    async replyMessage(lineEvent) {
        var replyToken = lineEvent.replyToken;
        var messageEvent = lineEvent.message;
        var userId = lineEvent.source.userId;
        try {
            var reply = [];
            var logState;
            var logStates = await this.dbLog.findUserLogByIdIn30Min(userId);
            if (logStates == undefined || logStates.length == 0) {
                logState = new UserLog_1.UserLog(messageEvent.id);
                logState.userId = userId;
            }
            else {
                logState = logStates[0];
            }
            logState.input.push(messageEvent.text);
            // QnA Maker で回答を試みる
            this.qnaMaker = new QnaMaker_1.QnaMaker(this.context);
            const qnaFirstRes = await this.qnaMaker.GetQnaAnswer(messageEvent.text);
            if (qnaFirstRes.answers[0].score != 0) {
                this.context.log("QnAMaker回答成功");
                logState.questions.push(qnaFirstRes.answers[0].questions[0]);
                logState.answers.push(qnaFirstRes.answers[0].answer);
                logState.updateAt = Date.now();
                this.dbLog.upsertUserLog(logState);
                const qnaChoice = this.qnaMaker.GenerateSelection(qnaFirstRes.answers[0]);
                reply.push(qnaChoice);
                return await this.client.replyMessage(replyToken, qnaChoice);
            }
            else {
                //QnA Maker で回答できなかった
                this.context.log("QnAMaker回答失敗");
                if (logState.input.length == 1) {
                    this.context.log("Eliza回答");
                    // 初回なのでELIZAで回答
                    this.eliza = new Eliza_1.Eliza(this.context);
                    const elizaRes = await this.eliza.GetAnswer(messageEvent.text);
                    reply.push(Util_1.Util.generateTextMessage(elizaRes));
                    logState.answers.push(elizaRes);
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                    return await this.client.replyMessage(replyToken, reply);
                }
                else {
                    // 2度目のメッセージなので、窓口案内
                    this.context.log("窓口回答");
                    const announce = GeneralReply_1.GeneralReply.GetFailureReply();
                    reply.push(Util_1.Util.generateTextMessage(announce));
                    logState.feedback = 'CannotAnswer';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                    return await this.client.replyMessage(replyToken, reply);
                }
            }
        }
        catch (err) {
            this.context.log(`[MessageTextResponse] error: ${err}`);
            // 何かしらのエラーが発生したので、メッセージだけは返す。
            var reply = [];
            reply.push(Util_1.Util.generateTextMessage(GeneralReply_1.GeneralReply.GetErrorMessage()));
            await this.client.replyMessage(replyToken, reply);
        }
    }
}
exports.MessageTextResponse = MessageTextResponse;
