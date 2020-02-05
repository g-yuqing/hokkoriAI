import * as LineTypes from "@line/bot-sdk/lib/types";
import {FeedbackData, AskMidwifeData} from "./Types/types";

class Util {
    public static generateTextMessage(message: string): LineTypes.TextMessage {
        var reply: LineTypes.TextMessage = { type: 'text', text: message }
        return reply;
    }

    public static generateAskMidwifeForm(): LineTypes.TemplateMessage {
        var askMidwifeDataTrue: AskMidwifeData = { kind:"askmidwife", result: true };
        var askMidwifeDataFalse: AskMidwifeData = { kind:"askmidwife", result: false };

        var actions: LineTypes.Action[] = [
            {
                type: "postback",
                label: "子育てサポータに相談する",
                data: `${JSON.stringify(askMidwifeDataTrue)}`,
                displayText: `相談する`
            },
            {
                type: "postback",
                label: "いいえ",
                data: `${JSON.stringify(askMidwifeDataFalse)}`,
                displayText: 'いいえ'
            }
        ]


        var resTemplate: LineTypes.TemplateButtons = {
            type: "buttons",
            title: "子育てサポータさん",
            text: "子育てサポータさんに相談しますか？",
            actions: actions
        };

        var res: LineTypes.TemplateMessage = {
            type: "template",
            altText: "子育てサポータさんに相談しますか？",
            template: resTemplate
        };

        return res;
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
