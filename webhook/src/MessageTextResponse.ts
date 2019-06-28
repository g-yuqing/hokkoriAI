import { Context } from "@azure/functions";
import * as Line from "@line/bot-sdk";
import * as LineTypes from "@line/bot-sdk/lib/types"
import { CosmosDbLog } from "./cosmosdb/CosmosDbLog";
import { Eliza } from "./Eliza/Eliza";
import { UserLog } from "./cosmosdb/UserLog";
import { QnaMaker } from "./qnaMaker/QnaMaker";
import { Util } from "./Util";
import { GeneralReply } from "./GeneralReply/GeneralReply";

class MessageTextResponse {
    client: Line.Client;
    context: Context;
    dbLog: CosmosDbLog;
    qnaMaker: QnaMaker | null;
    eliza: Eliza | null;

    constructor(lineClient: Line.Client, context: Context) {
        this.client = lineClient;
        this.context = context;
        this.dbLog = new CosmosDbLog(this.context);
        this.qnaMaker = null;
        this.eliza = null;
    }

    async init() {
        await this.dbLog.init();
    }

    async replyMessage(lineEvent: LineTypes.MessageEvent) {
        var replyToken = lineEvent.replyToken;
        var messageEvent = lineEvent.message as LineTypes.TextEventMessage;
        var userId = lineEvent.source.userId!;
        try {
            var reply = [];
            var logState: UserLog;
            var logStates = await this.dbLog.findUserLogByIdIn30Min(userId);
            if (logStates == undefined || logStates.length == 0) {
                logState = new UserLog(messageEvent.id);
                logState.userId = userId;
            } else {
                logState = logStates[0];
            }
            logState.input.push(messageEvent.text);

            // QnA Maker で回答を試みる
            this.qnaMaker = new QnaMaker(this.context);
            const qnaFirstRes = await this.qnaMaker.GetQnaAnswer(messageEvent.text);
            if (qnaFirstRes!.answers[0].score != 0) {
                this.context.log("QnAMaker回答成功");
                logState.questions.push(qnaFirstRes!.answers[0].questions[0]);
                logState.answers.push(qnaFirstRes!.answers[0].answer);
                logState.updateAt = Date.now();
                this.dbLog.upsertUserLog(logState);

                const qnaChoice = this.qnaMaker.GenerateSelection(qnaFirstRes!.answers[0]);
                reply.push(qnaChoice);
                return await this.client.replyMessage(replyToken, qnaChoice);
            } else {
                //QnA Maker で回答できなかった
                this.context.log("QnAMaker回答失敗");
                if (logState.input.length == 1) {
                    this.context.log("Eliza回答");
                    // 初回なのでELIZAで回答
                    this.eliza = new Eliza(this.context)
                    const elizaRes = await this.eliza.GetAnswer(messageEvent.text)
                    reply.push(Util.generateTextMessage(elizaRes));
                    logState.answers.push(elizaRes);
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                    return await this.client.replyMessage(replyToken, reply);
                } else {
                    // 2度目のメッセージなので、窓口案内
                    this.context.log("窓口回答");
                    const announce = GeneralReply.GetFailureReply();
                    reply.push(Util.generateTextMessage(announce));
                    logState.feedback = 'CannotAnswer';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                    return await this.client.replyMessage(replyToken, reply);
                }
            }
        } catch (err) {
            this.context.log(`[MessageTextResponse] error: ${err}`);
            // 何かしらのエラーが発生したので、メッセージだけは返す。
            var reply = [];
            reply.push(Util.generateTextMessage(GeneralReply.GetErrorMessage()));
            await this.client.replyMessage(replyToken, reply);
        }
    }
}

export { MessageTextResponse };
