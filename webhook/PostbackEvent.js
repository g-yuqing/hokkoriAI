"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CosmosDbLog_1 = require("./cosmosdb/CosmosDbLog");
const Util_1 = require("./Util");
const GeneralReply_1 = require("./GeneralReply/GeneralReply");
class PostbackEvent {
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
    async replyMessage(postbackEvent) {
        var replyToken = postbackEvent.replyToken;
        var postback = postbackEvent.postback;
        var userId = postbackEvent.source.userId;
        try {
            var reply = [];
            var logState;
            var logStates = await this.dbLog.findUserLogByIdIn30Min(userId);
            if (logStates == undefined || logStates.length == 0 || logStates[0].feedback != "none") {
                // 忘れてしまったアナウンスしておわり
                const announce = GeneralReply_1.GeneralReply.GetRequestAgain();
                reply.push(Util_1.Util.generateTextMessage(announce));
                return await this.client.replyMessage(replyToken, reply);
            }
            else {
                logState = logStates[0];
            }
            let feedbackData = JSON.parse(postback.data);
            if (feedbackData.kind === "feedback") {
                if (feedbackData.result) {
                    // 回答満足
                    const announce = GeneralReply_1.GeneralReply.GetEndGreeting();
                    reply.push(Util_1.Util.generateTextMessage(announce));
                    logState.feedback = 'Satisfied';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                }
                else {
                    // 回答不満足。解決できなかったので、窓口案内
                    const announce = GeneralReply_1.GeneralReply.GetUnsatisfiedMessage();
                    reply.push(Util_1.Util.generateTextMessage(announce));
                    logState.feedback = 'NotSatisfied';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                }
            }
            else if (feedbackData.kind === "qaconfirm") {
                if (feedbackData.result) {
                    // 回答要求
                    reply.push(Util_1.Util.generateTextMessage(logState.answers[logState.answers.length - 1]));
                    // Send Feedback Request
                    reply.push(Util_1.Util.generateFeedBackForm());
                }
                else {
                    // 解決できなかったので、窓口案内
                    const announce = GeneralReply_1.GeneralReply.GetFailureReply();
                    reply.push(Util_1.Util.generateTextMessage(announce));
                    logState.feedback = 'CannotAnswer';
                    logState.updateAt = Date.now();
                    this.dbLog.upsertUserLog(logState);
                }
            }
            return await this.client.replyMessage(replyToken, reply);
        }
        catch (err) {
            this.context.log("[PostbackEvent] somthing happen.");
            this.context.log(err);
            return;
        }
    }
}
exports.PostbackEvent = PostbackEvent;
