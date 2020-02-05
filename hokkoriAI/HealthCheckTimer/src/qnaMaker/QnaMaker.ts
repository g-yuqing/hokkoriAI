import { Context } from "@azure/functions";
import Axios, { AxiosRequestConfig } from "axios";

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