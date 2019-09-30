import { Context } from "@azure/functions";
import * as Line from "@line/bot-sdk";
import * as LineTypes from "@line/bot-sdk/lib/types"
import { CosmosDbLog } from "./cosmosdb/CosmosDbLog";
import { Eliza } from "./Eliza/Eliza";
import { UserLog } from "./cosmosdb/UserLog";
import { QnaMaker } from "./qnaMaker/QnaMaker";
import { Util } from "./Util";
import { GeneralReply } from "./GeneralReply/GeneralReply";
import { PostBackData, MidwifeRequestInfoData, FeedbackData, AskMidwifeData } from "./Types/types";
import { MidwifeInfoDatabase } from "./MidwifeInfo/MidwifeInfoDatabase";

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
            var logState: UserLog;
            var logStates = await this.dbLog.findUserLogByIdIn30Min(userId);
            var reply: LineTypes.Message[] = [];

            if (logStates == undefined || logStates.length == 0) {
                // 忘れてしまったアナウンスしておわり
                const announce = GeneralReply.GetRequestAgain();
                reply.push(Util.generateTextMessage(announce));
                return await this.client.replyMessage(replyToken, reply);
            } else {
                logState = logStates[0];
            }

            let postbackData: PostBackData = JSON.parse(postback.data);
            if (postbackData.kind === 'midwiferequestfino') {
                let midwifeInfo = postbackData as MidwifeRequestInfoData;
                reply.push(Util.generateTextMessage(`${midwifeInfo.midwife_name}さんのLINE IDは"${midwifeInfo.lineid}"です。\nよかったら友達申請してみてくださいね。`));
                logState.state = 'none';

            } else if (postbackData.kind === "askmidwife") {
                let askMidWife = postbackData as AskMidwifeData;
                if (askMidWife.result) {
                    logState.state = "RequestSupport";
                    reply.push(Util.generateTextMessage("子育てサポータを探してみるね。\nご希望の日付と時間を入力してくださいね。"));
                } else {
                    logState.state = "none";
                    reply.push(Util.generateTextMessage(GeneralReply.GetPleaseAskAgain()));
                }

            } else if (postbackData.kind === "feedback") {
                let feedbackData = postbackData as FeedbackData;
                if (feedbackData.result) {
                    // 回答満足
                    const announce = GeneralReply.GetEndGreeting();
                    reply.push(Util.generateTextMessage(announce));
                    logState.feedback = 'Satisfied';
                    logState.state = "none"
                } else {
                    // 回答不満足。解決できなかったので、窓口案内
                    reply.push(Util.generateTextMessage(GeneralReply.GetUnsatisfiedMessage()));
                    reply.push(Util.generateAskMidwifeForm());
                    logState.feedback = 'NotSatisfied';
                }
            }
            logState.updateAt = Date.now();
            this.dbLog.upsertUserLog(logState);
            return await this.client.replyMessage(replyToken, reply);
        } catch (err) {
            this.context.log("[PostbackEvent] somthing happen.");
            this.context.log(err);
            return
        }
    }
}

export { PostbackEvent }