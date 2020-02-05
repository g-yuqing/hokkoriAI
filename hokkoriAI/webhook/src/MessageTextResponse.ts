import { Context } from "@azure/functions";
import * as Line from "@line/bot-sdk";
import * as LineTypes from "@line/bot-sdk/lib/types"
import { CosmosDbLog } from "./cosmosdb/CosmosDbLog";
import { Eliza } from "./Eliza/Eliza";
import { UserLog } from "./cosmosdb/UserLog";
import { QnaMaker } from "./qnaMaker/QnaMaker";
import { Util } from "./Util";
import { GeneralReply } from "./GeneralReply/GeneralReply";
import { MidwifeInfoDatabase } from "./MidwifeInfo/MidwifeInfoDatabase";
import { LUIS, LuisResponse } from "./LUIS/LUIS";
import { getDefaultSettings } from "http2";

class MessageTextResponse {
    client: Line.Client;
    context: Context;
    dbLog: CosmosDbLog;
    qnaMaker: QnaMaker | null;
    luis: LUIS | null;
    eliza: Eliza | null;

    constructor(lineClient: Line.Client, context: Context) {
        this.client = lineClient;
        this.context = context;
        this.dbLog = new CosmosDbLog(this.context);
        this.qnaMaker = null;
        this.luis = null
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
            var logState: UserLog;
            var logStates = await this.dbLog.findUserLogByIdIn30Min(userId);
            if (logStates == undefined || logStates.length == 0) {
                logState = new UserLog(messageEvent.id);
                logState.userId = userId;
            } else {
                logState = logStates[0];
            }
            logState.inputStrings.push(messageEvent.text);

            var reply: LineTypes.Message[] = [];
            var dateStr = "";
            var timeStr = "";
            // LUISに問い合わせる
            this.luis = new LUIS(this.context);
            const luisRes = await this.luis.GetLuisAnswer(messageEvent.text);

            // Debug用
            if (messageEvent.text == 'やりなおす') {
                logState.state = "none";
                logState.updateAt = Date.now();
                this.dbLog.upsertUserLog(logState);
                reply.push(Util.generateTextMessage("会話を中断します"));
                return await this.client.replyMessage(replyToken, reply);
            }

            switch (logState.state) {
                case "RequestSupport":
                    if (luisRes!.topScoringIntent.intent == 'Utilities.Confirm' && luisRes!.topScoringIntent.score > 0.8 && logState.estimateDate != "" && logState.estimateTime != "") {
                        logState.confirmDate = logState.estimateDate;
                        logState.confirmTime = logState.estimateTime;
                        logState.state = "RecommendSupporter";

                        // サポータ検索
                        var confirmTimeInt = Number(logState.confirmTime.replace('時', '').replace('分', ''));
                        var midwifeList = await new MidwifeInfoDatabase(this.context).GetMidwifeInfoWithSupportTimeAsync(confirmTimeInt);
                        if (midwifeList.length != 0) {
                            var carousel: LineTypes.TemplateCarousel = {
                                type: "carousel",
                                columns: midwifeList.map(info => info.GenerateTemplateColumn()),
                            }
                            var tempalteMesssage: LineTypes.TemplateMessage = {
                                type: "template",
                                altText: "子育てサポータさんの情報",
                                template: carousel,
                            }

                            reply.push(tempalteMesssage);
                        } else {
                            reply.push(Util.generateTextMessage("子育てサポータさんが見つかりませんでした。"));
                        }
                    } else {
                        var [estimateTime, keyword] = this.GetTimeFromUserInput(messageEvent.text);
                        var estimateDate = this.GetDateFromUserInput(messageEvent.text);

                        if (luisRes!.topScoringIntent.intent == 'Utilities.Reject' && luisRes!.topScoringIntent.score > 0.8 && estimateDate == "" && estimateTime == "") {
                            // 単純な拒否
                            reply.push(Util.generateTextMessage("ご希望の日付と時間を入力してください。"));
                        } else {
                            if (estimateDate != "") {
                                logState.estimateDate = estimateDate;
                            } else {
                                if (logState.estimateDate == "") {
                                    // 日付情報がないので、今日として確認
                                    var today = new Date(); // today
                                    var dd = String(today.getDate()).padStart(2, '0');
                                    var mm = String(today.getMonth() + 1).padStart(2, '0'); //1月は０
                                    var yyyy = String(today.getFullYear());
                                    estimateDate = `${yyyy}年${mm}月${dd}日`;
                                    logState.estimateDate = estimateDate;
                                }
                            }

                            if (estimateTime != "") {
                                logState.estimateTime = estimateTime;
                            }

                            reply = reply.concat(this.GetDateConfirmReplies(logState.estimateDate, logState.estimateTime, keyword));
                        }
                    }
                    break;
                case "RecommendSupporter":
                    reply.push(Util.generateTextMessage("よければ、希望する子育てサポータさんを選んでね。"))
                    break;
                default:
                    if (luisRes!.topScoringIntent.intent == 'RequestSupport' && luisRes!.topScoringIntent.score > 0.9) {
                        var dateTimeReply = []
                        reply.push(Util.generateTextMessage("子育てサポートの希望ですね。"));
                        [dateTimeReply, dateStr, timeStr] = this.GetDateConfirmRepliesFromLuisResponse(luisRes!)
                        reply = reply.concat(dateTimeReply);
                        logState.state = "RequestSupport";
                        logState.estimateDate = dateStr;
                        logState.estimateTime = timeStr;
                    } else if (luisRes!.topScoringIntent.intent == 'Greeting' && luisRes!.topScoringIntent.score > 0.8) {
                        // TODO: 挨拶などする
                        const greets = luisRes!.entities.filter(entity => entity.type == 'greet');
                        if (greets.length == 0) {
                            reply.push(Util.generateTextMessage("こんにちは。子育てに関する質問や、子育てサポータさんへの依頼を話しかけてね。"));
                        } else {
                            reply.push(Util.generateTextMessage(greets[0].entity+"。子育てに関する質問や、子育てサポータさんへの依頼を話しかけてね。"))
                        }
                        logState.state = "Greeting";
                    } else if (luisRes!.topScoringIntent.intent == "Thankyou" && luisRes!.topScoringIntent.score > 0.8) {
                        reply.push(Util.generateTextMessage(GeneralReply.GetEndGreeting()));
                        logState.state = "thankyou";
                    } else {
                        // QnA Maker で回答を試みる
                        this.qnaMaker = new QnaMaker(this.context);
                        const qnaFirstRes = await this.qnaMaker.GetQnaAnswer(messageEvent.text);
                        if (qnaFirstRes!.answers[0].score != 0) {
                            this.context.log("QnAMaker回答成功");
                            logState.questions.push(qnaFirstRes!.answers[0].questions[0]);
                            logState.answers.push(qnaFirstRes!.answers[0].answer);
                            logState.state = "feedback";
                            reply.push(Util.generateTextMessage(qnaFirstRes!.answers[0].answer));
                            reply.push(Util.generateFeedBackForm());
                        } else {
                            //QnA Maker で回答できなかった
                            this.context.log("QnAMaker回答失敗");
                            if (logState.state == 'none' || logState.state == "Greeting" || logState.state == "thankyou") {
                                this.context.log("Eliza回答");
                                // 初回なのでELIZAで回答
                                this.eliza = new Eliza(this.context)
                                const elizaRes = await this.eliza.GetAnswer(messageEvent.text)
                                reply.push(Util.generateTextMessage(elizaRes));
                                logState.answers.push(elizaRes);
                                logState.state = "qnaAnswer";
                                this.context.log(reply);
                            } else if (logState.state == 'qnaAnswer') {
                                // 2度目のメッセージなので、子育てサポータさん紹介
                                this.context.log("窓口回答");
                                reply.push(Util.generateTextMessage("お役になてなくてごめんね。よかったら子育てサポータさんに聞いてみてください。"))
                                reply.push(Util.generateAskMidwifeForm());
                                logState.feedback = 'CannotAnswer';
                                this.context.log(reply);
                            } else {
                                this.context.log("なににも該当しない");
                                reply.push(Util.generateTextMessage("ごめんね。まだわからないの。違う言い方に変えてもらえますか？"))

                            }
                        }
                    }
                    break;
            }

            logState.updateAt = Date.now();
            this.dbLog.upsertUserLog(logState);
            return await this.client.replyMessage(replyToken, reply);
        } catch (err) {
            this.context.log(`[MessageTextResponse] error: ${err}`);
            // 何かしらのエラーが発生したので、メッセージだけは返す。
            var reply: LineTypes.Message[] = [];
            reply.push(Util.generateTextMessage(GeneralReply.GetErrorMessage()));
            await this.client.replyMessage(replyToken, reply);
        }
    }

    GetDateConfirmRepliesFromLuisResponse(luisRes: LuisResponse): [LineTypes.Message[], string, string] {
        var reply = [];
        var dateStr = this.GetDataFromLuisRes(luisRes);
        var [timeStr, keyword] = this.GetTimeFromLuisRes(luisRes);
        reply = this.GetDateConfirmReplies(dateStr, timeStr, keyword);
        return [reply, dateStr, timeStr]
    }

    GetDateConfirmReplies(dateStr: string, timeStr: string, keyword: string): LineTypes.Message[] {
        var reply = [];
        if (dateStr != "" && timeStr != "") {
            // 日付、時間が揃っているので、確認
            reply.push(Util.generateTextMessage(dateStr));
            var timeConfirm = timeStr;
            if (keyword != "") {
                // 曖昧な時間なので確認
                timeConfirm = `${keyword}というのは、${timeConfirm}でよろしかったですか？`;
                reply.push(Util.generateTextMessage(timeConfirm));
            } else {
                reply.push(Util.generateTextMessage(timeConfirm));
                reply.push(Util.generateTextMessage("希望でよろしかったですか？"));
            }
        } else if (dateStr == "" && timeStr != "") {
            // 日付を今日として確認
            var today = new Date(); // today
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //1月は０
            var yyyy = String(today.getFullYear());
            dateStr = `${yyyy}年${mm}月${dd}日`;
            reply.push(Util.generateTextMessage(dateStr));
            reply.push(Util.generateTextMessage(timeStr));
            reply.push(Util.generateTextMessage("希望でよろしかったですか？"));
        } else if (dateStr != "" && timeStr == "") {
            // 日付はわかったので、時間を確認
            reply.push(Util.generateTextMessage(dateStr));
            reply.push(Util.generateTextMessage('時間はいつを希望でしょうか？'));
        } else if (dateStr == "" && timeStr == "") {
            reply.push(Util.generateTextMessage('日付と時間はいつを希望でしょうか？'));
        }
        return reply;
    }

    GetDateFromUserInput(inputStr: string): string {
        var yyyy: string = "";
        var mm: string = "";
        var dd: String = "";

        if (inputStr.includes('今日')) {
            var today = new Date(); // today
            dd = String(today.getDate()).padStart(2, '0');
            mm = String(today.getMonth() + 1).padStart(2, '0'); //1月は０
            yyyy = String(today.getFullYear());
            return `${yyyy}年${mm}月${dd}日`;
        } else if (inputStr.includes('明日')) {
            var tommorow = new Date(); // today
            tommorow.setDate(tommorow.getDate() + 1); // tommorow
            dd = String(tommorow.getDate()).padStart(2, '0');
            mm = String(tommorow.getMonth() + 1).padStart(2, '0'); //1月は０
            yyyy = String(tommorow.getFullYear());
            return `${yyyy}年${mm}月${dd}日`;
        } else if (inputStr.includes('明後日')) {
            var dayAfterTommorow = new Date(); // today
            dayAfterTommorow.setDate(dayAfterTommorow.getDate() + 2); //dayAfterTommorow
            dd = String(dayAfterTommorow.getDate()).padStart(2, '0');
            mm = String(dayAfterTommorow.getMonth() + 1).padStart(2, '0'); //1月は０
            yyyy = String(dayAfterTommorow.getFullYear());
            return `${yyyy}年${mm}月${dd}日`;
        }

        // 日付の正規表現にて検索する
        var pattern = new RegExp("(([0-9０-９]{1,4})[-\/\.／－ー．年]{1})?([0-9０-９]{1,2})[-\/\.／－ー．月]{1}(([0-9０-９]{1,2})[-\/\.／－ー．日]?)?")
        var dateResult = inputStr.match(pattern);

        if (dateResult != null) {
            if (dateResult[5] !== undefined) {
                dd = String(dateResult[5]).padStart(2, '0');
            }

            if (dd != "" && dateResult[3] !== undefined) {
                mm = String(dateResult[3]).padStart(2, '0');
            } else if (dd != "") {
                var today = new Date();
                if (today.getDate() >= Number(dd)) {
                    mm = String(today.getMonth()).padStart(2, '0');
                } else {
                    today.setMonth(today.getMonth() + 1 + 1); //1月は０
                    mm = String(today.getMonth()).padStart(2, '0');
                }
            }

            if (dd != "" && mm != "" && dateResult[2] !== undefined) {
                yyyy = dateResult[2];
            } else {
                var today = new Date();
                if (today.getMonth() <= Number(mm)) {
                    yyyy = String(today.getFullYear());
                } else {
                    today.setFullYear(today.getFullYear() + 1);
                    yyyy = String(today.getFullYear());
                }
            }

            return `${yyyy}年${mm}月${dd}日`;
        }

        return "";
    }

    GetDataFromLuisRes(luisRes: LuisResponse): string {
        const dateStricts = luisRes.entities.filter(entity => entity.role == 'strict_date');
        var yyyy: string = "";
        var mm: string = "";
        var dd: String = "";

        if (dateStricts.length == 1) {
            // strict_dateが１つ以上の場合、候補が多すぎる
            if (dateStricts[0].entity == '今日') {
                var today = new Date(); // today
                dd = String(today.getDate()).padStart(2, '0');
                mm = String(today.getMonth() + 1).padStart(2, '0'); //1月は０
                yyyy = String(today.getFullYear());
                return `${yyyy}年${mm}月${dd}日`;
            } else if (dateStricts[0].entity == '明日') {
                var tommorow = new Date(); // today
                tommorow.setDate(tommorow.getDate() + 1); // tommorow
                dd = String(tommorow.getDate()).padStart(2, '0');
                mm = String(tommorow.getMonth() + 1).padStart(2, '0'); //1月は０
                yyyy = String(tommorow.getFullYear());
                return `${yyyy}年${mm}月${dd}日`;
            } else if (dateStricts[0].entity == '明後日') {
                var dayAfterTommorow = new Date(); // today
                dayAfterTommorow.setDate(dayAfterTommorow.getDate() + 2); //dayAfterTommorow
                dd = String(dayAfterTommorow.getDate()).padStart(2, '0');
                mm = String(dayAfterTommorow.getMonth() + 1).padStart(2, '0'); //1月は０
                yyyy = String(dayAfterTommorow.getFullYear());
                return `${yyyy}年${mm}月${dd}日`;
            }
        }

        // 日付の正規表現にて検索する
        var pattern = new RegExp("(([0-9０-９]{1,4})[-\/\.／－ー．年]{1})?([0-9０-９]{1,2})[-\/\.／－ー．月]{1}(([0-9０-９]{1,2})[-\/\.／－ー．日]?)?")
        var dateResult = luisRes.query.match(pattern);

        if (dateResult != null) {
            if (dateResult[5] !== undefined) {
                dd = String(dateResult[5]).padStart(2, '0');
            }

            if (dd != "" && dateResult[3] !== undefined) {
                mm = String(dateResult[3]).padStart(2, '0');
            } else if (dd != "") {
                var today = new Date();
                if (today.getDate() >= Number(dd)) {
                    mm = String(today.getMonth()).padStart(2, '0');
                } else {
                    today.setMonth(today.getMonth() + 1 + 1); //1月は０
                    mm = String(today.getMonth()).padStart(2, '0');
                }
            }

            if (dd != "" && mm != "" && dateResult[2] !== undefined) {
                yyyy = dateResult[2];
            } else {
                var today = new Date();
                if (today.getMonth() <= Number(mm)) {
                    yyyy = String(today.getFullYear());
                } else {
                    today.setFullYear(today.getFullYear() + 1);
                    yyyy = String(today.getFullYear());
                }
            }

            return `${yyyy}年${mm}月${dd}日`;
        }

        return "";
    }

    GetTimeFromUserInput(inputStr: string): [string, string] {
        var hour: number | null = null;
        var minute: number = 0;

        var editedMessage = inputStr.replace("時半", "時30分")
        var datePattern = new RegExp("([0-9０-９]{1,2})[:：時]([0-9０-９]{1,2})?分?");
        var resultTime = editedMessage.match(datePattern);
        if (resultTime != null) {
            if (resultTime[1] !== undefined) {
                hour = Number(resultTime[1].replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
            }

            if (resultTime[2] !== undefined) {
                minute = Number(resultTime[2].replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
            }

            if (minute == null || minute == NaN) {
                minute = 0;
            }

            if (hour != null && hour > 12) {
                // 午後が確定している
                return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
            }
        }

        const morning = inputStr.includes("午前") || inputStr.includes("朝");
        const evening = inputStr.includes("午後") || inputStr.includes("夕方") || inputStr.includes("昼");
        if (hour != null && morning && !evening) {
            return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
        } else if (hour != null && evening && !morning) {
            hour = hour + 12;
            return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
        }

        if (morning) {
            if (inputStr.includes("午前")) {
                return [`10時00分`, "午前"];
            } else if (inputStr.includes("朝")) {
                return [`10時00分`, "朝"];
            }
        }

        if (evening) {
            if (inputStr.includes("午後")) {
                return [`15時00分`, "午後"];
            } else if (inputStr.includes("夕方")) {
                return [`15時00分`, "夕方"];
            } else if (inputStr.includes("昼")) {
                return [`15時00分`, "昼"];
            }
        }

        if (hour != null && hour >= 7 && hour <= 12) {
            return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
        }

        if (hour != null && hour >= 0 && hour <= 6) {
            hour = hour + 12;
            return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
        }

        return ["", ""];
    }

    GetTimeFromLuisRes(luisRes: LuisResponse): [string, string] {
        const timeStricts = luisRes.entities.filter(entity => entity.role == 'strict_time');
        const timeAbstracts = luisRes.entities.filter(entity => entity.role == 'abstract_time');
        var hour: number | null = null;
        var minute: number = 0;
        if (timeStricts.length > 0) {
            var editedMessage = luisRes.query.replace("時半", "時30分")
            var datePattern = new RegExp("([0-9０-９]{1,2})[:：時]([0-9０-９]{1,2})?分?");
            var resultTime = editedMessage.match(datePattern);
            if (resultTime != null) {
                if (resultTime[1] !== undefined) {
                    hour = Number(resultTime[1].replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
                }

                if (resultTime[2] !== undefined) {
                    minute = Number(resultTime[2].replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 65248); }));
                }

                if (minute == null || minute == NaN) {
                    minute = 0;
                }

                if (hour != null && hour > 12) {
                    // 午後が確定している
                    return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
                }
            }
        }

        if (timeAbstracts.length > 0) {
            const morning = timeAbstracts.some(abst => (abst.entity == "午前") || (abst.entity == "朝"));
            const evening = timeAbstracts.some(abst => (abst.entity == "午後") || (abst.entity == "夕方") || (abst.entity == "昼"));
            if (hour != null && morning && !evening) {
                return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
            } else if (hour != null && evening && !morning) {
                hour = hour + 12;
                return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
            }

            if (morning) {
                const keyword = timeAbstracts.find(abst => (abst.entity == "午前") || (abst.entity == "朝"));
                return [`10時00分`, keyword!.entity];
            }

            if (evening) {
                const keyword = timeAbstracts.find(abst => (abst.entity == "午後") || (abst.entity == "夕方") || (abst.entity == "昼"));
                return [`15時00分`, keyword!.entity];
            }
        }

        if (hour != null && hour >= 7 && hour <= 12) {
            return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
        }

        if (hour != null && hour >= 0 && hour <= 6) {
            hour = hour + 12;
            return [`${String(hour).padStart(2, '0')}時${String(minute).padStart(2, '0')}分`, ""];
        }

        return ["", ""];
    }
}

export { MessageTextResponse };
