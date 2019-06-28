import * as LineTypes from "@line/bot-sdk/lib/types";
import {FeedbackData} from "./Types/types";

class Util {
    public static generateTextMessage(message: string): LineTypes.TextMessage {
        var reply: LineTypes.TextMessage = { type: 'text', text: message }
        return reply;
    }

    public static generateFeedBackForm(): LineTypes.TemplateMessage {
        var feedbackDataTrue: FeedbackData = { kind: "feedback", result: true };
        var feedbackDataFalse: FeedbackData = { kind: "feedback", result: false };
        var actions: LineTypes.Action[] = [
            {
                type: "postback",
                label: "はい",
                data: `${JSON.stringify(feedbackDataTrue)}`,
                displayText: "はい"
            },
            {
                type: "postback",
                label: "いいえ",
                data: `${JSON.stringify(feedbackDataFalse)}`,
                displayText: "いいえ"
            }
        ];

        var resTemplate: LineTypes.TemplateButtons = {
            type: "buttons",
            title: "フィードバックお願いします",
            text: "この回答は役に立ちましたか？",
            actions: actions
        };

        var res: LineTypes.TemplateMessage = {
            type: "template",
            altText: "フィードバックお願いします",
            template: resTemplate
        };

        return res;
    }
}

export { Util };
