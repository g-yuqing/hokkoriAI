"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class QnaMaker {
    constructor(context) {
        this.context = context;
    }
    async GetQnaAnswer(text) {
        const url = 'https://hokkoriai-qna.azurewebsites.net/qnamaker/knowledgebases/7a05a644-aacc-4177-b3af-73f3d249fe8f/generateAnswer';
        const data = { question: `${text}`, top: 1, scoreThreshold: 40 };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'EndpointKey 0c088b78-4811-4565-b452-d121ae9075b1'
            },
        };
        try {
            const res = await axios_1.default.post(url, data, config);
            let jsonStr = JSON.stringify(res.data);
            let qnaRes = JSON.parse(jsonStr);
            return qnaRes;
        }
        catch (err) {
            this.context.log(`[GetQnaAnswer] axios post error: ${err}`);
            return null;
        }
    }
    GenerateSelection(answer) {
        var qaconfirmDataTrue = { kind: "qaconfirm", result: true };
        var qaconfirmDataFalse = { kind: "qaconfirm", result: false };
        var actions = [
            {
                type: "postback",
                label: "はい",
                data: `${JSON.stringify(qaconfirmDataTrue)}`,
                displayText: "はい"
            },
            {
                type: "postback",
                label: "いいえ",
                data: `${JSON.stringify(qaconfirmDataFalse)}`,
                displayText: "いいえ"
            }
        ];
        var resTemplate = {
            type: "buttons",
            title: "質問を選んでね",
            text: `あなたの質問は\"${answer.questions[0]}\"であっていますか？`,
            actions: actions
        };
        var res = {
            type: "template",
            altText: "質問を選んでね",
            template: resTemplate
        };
        return res;
    }
}
exports.QnaMaker = QnaMaker;
