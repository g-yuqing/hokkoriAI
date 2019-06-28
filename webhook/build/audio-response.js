"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Request = __importStar(require("request-promise"));
const Util_1 = require("./Util");
require('tls').DEFAULT_ECDH_CURVE = 'auto';
class AudioResponse {
    constructor(lineClient, context) {
        this.client = lineClient;
        this.context = context;
    }
    async replyMessage(replyToken, message) {
        const downloadPath = path.join(__dirname, 'tempfile', 'audio.m4a'), url = 'https://hokkoriaiv2.azurewebsites.net/api/audio?code=IVrbgLW1rSBVynREaNF0dc2X4O391/FobzDzAbJgA0kq6rm5nP/WvQ==';
        try {
            await this.downloadAudio(message.id, downloadPath);
            this.context.log('AudioResponse: file saved, send messages to 3rd server');
            var formData = {
                file: fs.createReadStream(downloadPath),
            };
            const requestOptions = {
                url: `${url}`,
                formData: formData,
            };
            const res = await Request.post(requestOptions);
            this.context.log(res);
            const replyText = {
                fussy: '泣きの理由がなさそうです',
                hungry: 'お腹が空いてるようです',
                pain: '痛みを感じているようです',
            };
            const reply = Util_1.Util.generateTextMessage("");
            const obj = JSON.parse(res);
            const key = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
            if (obj.hasOwnProperty(key)) {
                reply.text = replyText[key];
            }
            await this.client.replyMessage(replyToken, reply);
            return;
        }
        catch (err) {
            this.context.log(`axios post error: ${err}`);
        }
    }
    downloadAudio(messageId, downloadPath) {
        return this.client.getMessageContent(messageId)
            .then(stream => new Promise((resolve, reject) => {
            const writable = fs.createWriteStream(downloadPath);
            stream.pipe(writable);
            stream.on('end', () => resolve(downloadPath));
            stream.on('error', reject);
        }));
    }
}
exports.AudioResponse = AudioResponse;
