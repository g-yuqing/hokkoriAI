import * as fs from "fs";
import * as path from "path";
import * as Request from "request-promise";
import { Context } from "@azure/functions";
import * as Line from "@line/bot-sdk";
import * as LineTypes from "@line/bot-sdk/lib/types";
import { Util } from "./Util";
require('tls').DEFAULT_ECDH_CURVE = 'auto'

class AudioResponse {
    client: Line.Client;
    context: Context;

    constructor(lineClient: Line.Client, context: Context) {
        this.client = lineClient
        this.context = context
    }

    async replyMessage(replyToken: string, message: LineTypes.AudioEventMessage) {
        const downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a'),
            url = process.env.AudioURL!
        try {
            await this.downloadAudio(message.id, downloadPath)
            this.context.log('AudioResponse: file saved, send messages to 3rd server')
            var formData = {
                file: fs.createReadStream(downloadPath),
            };

            const requestOptions: Request.Options = {
                url: `${url}`,
                formData: formData,
            }

            const res = await Request.post(requestOptions);
            this.context.log(res)
            const replyText = {
                fussy: '泣きの理由がなさそうです',
                hungry: 'お腹が空いてるようです',
                pain: '痛みを感じているようです',
            } as ReplyInterface;

            const reply = Util.generateTextMessage("");
            const obj = JSON.parse(res)
            const key: string = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);

            if (obj.hasOwnProperty(key)) {
                reply.text = replyText[key];
            }

            await this.client.replyMessage(replyToken, reply)
            return
        } catch (err) {
            this.context.log(`axios post error: ${err}`)
        }

    }

    downloadAudio(messageId: string, downloadPath: string) {
        return this.client.getMessageContent(messageId)
            .then(stream => new Promise((resolve, reject) => {
                const writable = fs.createWriteStream(downloadPath)
                stream.pipe(writable)
                stream.on('end', () => resolve(downloadPath))
                stream.on('error', reject)
            }))
    }
}

interface ReplyInterface {
    fussy: string;
    hungry: string;
    pain: string;
    [key: string]: string;
}

export { AudioResponse }
