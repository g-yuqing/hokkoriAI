import { Context } from "@azure/functions";
import Axios, { AxiosRequestConfig } from "axios";

class LUIS {
    context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async GetLuisAnswer(text: string): Promise<LuisResponse | null> {
        const url = process.env.LuisURL!;
        const config: AxiosRequestConfig = {
            params: {
                'staging': true,
                'subscription-key': process.env.LuisAuthKey!,
                'q': `${text}`
            }
        }
        try {
            const res = await Axios.get(url, config);
            let jsonStr = JSON.stringify(res.data);
            let qnaRes: LuisResponse = JSON.parse(jsonStr);
            return qnaRes;
        } catch (err) {
            this.context.log(`[GetQnaAnswer] axios post error: ${err}`)
            return null;
        }
    }
}

interface LuisResponse {
    query: string
    topScoringIntent: intent;
    intents: intent[];
    entities: entity[];
}

interface intent {
    intent: string;
    score: number;
}

interface entity {
    entity: string;
    type: string;
    role: string;
}

export { LUIS, LuisResponse };