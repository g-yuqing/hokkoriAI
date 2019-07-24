import { Context } from "@azure/functions";
import Axios, { AxiosRequestConfig } from "axios";
import * as LineTypes from "@line/bot-sdk/lib/types";
import { QAConfirmData } from "../Types/types"

class QnaMaker {
    context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async GetQnaAnswer(text: string): Promise<QnaResponse | null> {
        const url = process.env.QnAURL!;
        const data = { question: `${text}`, top: 1, scoreThreshold: 40 };
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.QnAAuthKey!
            },
        }
        try {
            const res = await Axios.post(url, data, config);
            let jsonStr = JSON.stringify(res.data);
            let qnaRes: QnaResponse = JSON.parse(jsonStr);
            return qnaRes;
        } catch (err) {
            this.context.log(`[GetQnaAnswer] axios post error: ${err}`)
            return null;
        }
    }

    GenerateSelection(answer: answer): LineTypes.TemplateMessage {
        var qaconfirmDataTrue: QAConfirmData = { kind: "qaconfirm", result: true };
        var qaconfirmDataFalse: QAConfirmData = { kind: "qaconfirm", result: false };
        var actions: LineTypes.Action[] = [
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

        var resTemplate: LineTypes.TemplateButtons = {
            type: "buttons",
            title: "質問を選んでね",
            text: `あなたの質問は\"${answer.questions[0]}\"であっていますか？`,
            actions: actions
        };

        var res: LineTypes.TemplateMessage = {
            type: "template",
            altText: "質問を選んでね",
            template: resTemplate
        };

        return res;
    }
}

interface QnaResponse {
    answers: answer[];
}

interface answer {
    questions: string[];
    answer: string;
    score: number;
    id: number;
    source: string;
    metadata: any
}

export { QnaMaker };