import { Context } from "@azure/functions";
import * as Line from "@line/bot-sdk";
import * as LineTypes from "@line/bot-sdk/lib/types"
import { CosmosDbLog } from "./cosmosdb/CosmosDbLog";
import { Eliza } from "./Eliza/Eliza";
import { UserLog } from "./cosmosdb/UserLog";
import { QnaMaker } from "./qnaMaker/QnaMaker";
import { Util } from "./Util";
import { GeneralReply } from "./GeneralReply/GeneralReply";
import * as PostBackData from "./Types/types";

class PostbackEvent {
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

    async replyMessage(postbackEvent: LineTypes.PostbackEvent) {
        var replyToken = postbackEvent.replyToken;
        var postback = postbackEvent.postback as LineTypes.Postback;
        var userId = postbackEvent.source.userId!;
        try {
            var reply = [];
            var logState: UserLog;
            var logStates = await this.dbLog.findUserLogByIdIn30Min(userId);
            if (logStates == undefined || logStates.length == 0 || logStates[0].feedback != "none") {
                // 忘れてしまったアナウンスしておわり
                const announce = GeneralReply.GetRequestAgain();
                reply.push(Util.generateTextMessage(announce));
                return await this.client.replyMessage(replyToken, reply);
            } else {
                logState = logStates[0];
            }

            let feedbackData: PostBackData.PostBackData = JSON.parse(postback.data);
            if (feedbackData.kind === "feedback") {
                if (feedbackData.result) {
                    // 回答満足
                    const announce = GeneralReply.GetEndGreeting();
                    reply.push(Util.generateTextMessage(announce));
                    logState.feedback = 'Satisfied';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                } else {
                    // 回答不満足。解決できなかったので、窓口案内
                    const announce = GeneralReply.GetUnsatisfiedMessage();
                    reply.push(Util.generateTextMessage(announce));
                    logState.feedback = 'NotSatisfied';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                }

            } else if (feedbackData.kind === "qaconfirm") {
                if (feedbackData.result) {
                    // 回答要求
                    reply.push(Util.generateTextMessage(logState.answers[logState.answers.length - 1]));
                    // Send Feedback Request
                    reply.push(Util.generateFeedBackForm());
                } else {
                    // 解決できなかったので、窓口案内
                    const announce = GeneralReply.GetFailureReply();
                    reply.push(Util.generateTextMessage(announce));
                    logState.feedback = 'CannotAnswer';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                }
            }

            return await this.client.replyMessage(replyToken, reply);
        } catch (err) {
            this.context.log("[PostbackEvent] somthing happen.");
            this.context.log(err);
            return
        }
    }
}

export { PostbackEvent }