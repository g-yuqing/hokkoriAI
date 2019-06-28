"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    static generateTextMessage(message) {
        var reply = { type: 'text', text: message };
        return reply;
    }
    static generateFeedBackForm() {
        var feedbackDataTrue = { kind: "feedback", result: true };
        var feedbackDataFalse = { kind: "feedback", result: false };
        var actions = [
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
        var resTemplate = {
            type: "buttons",
            title: "フィードバックお願いします",
            text: "この回答は役に立ちましたか？",
            actions: actions
        };
        var res = {
            type: "template",
            altText: "フィードバックお願いします",
            template: resTemplate
        };
        return res;
    }
}
exports.Util = Util;
