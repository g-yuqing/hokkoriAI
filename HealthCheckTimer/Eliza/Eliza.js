"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Eliza {
    constructor(context) {
        this.context = context;
    }
    async GetAnswer(text) {
        const elizaUrl = 'https://hokkoriaiv2.azurewebsites.net/reply';
        const data = { message: text };
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
        };
        try {
            const elizaRes = await axios_1.default.post(elizaUrl, data, config);
            return elizaRes.data;
        }
        catch (err) {
            this.context.log(`[Eliza GetAnswer]axios post error: ${err}`);
            return "";
        }
    }
}
exports.Eliza = Eliza;
