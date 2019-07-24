import { Context } from "@azure/functions";
import Axios, { AxiosRequestConfig } from "axios";

class Eliza {
    context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async GetAnswer(text: string): Promise<string> {
        const elizaUrl = process.env.ElizaURL!
        const data = { message: text }
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json'
            },
        }
        try {
            const elizaRes = await Axios.post(elizaUrl, data, config);
            return elizaRes.data as string;
        } catch (err) {
            this.context.log(`[Eliza GetAnswer]axios post error: ${err}`)
            return "";
        }
    }
}

export { Eliza };