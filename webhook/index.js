"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Line = __importStar(require("@line/bot-sdk"));
const file_response_1 = require("./file-response");
const audio_response_1 = require("./audio-response");
const MessageTextResponse_1 = require("./MessageTextResponse");
const PostbackEvent_1 = require("./PostbackEvent");
const config = {
    channelAccessToken: process.env.ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new Line.Client(config);
const index = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    if (!req.body || !req.body.events) {
        context.res = {
            status: 400,
            body: 'Please access a properly way.'
        };
        context.done();
    }
    else {
        context.log(req.body.events);
        await Promise.all(req.body.events.map(handleEvent));
        context.res = { body: '' };
        context.done();
    }
    async function handleEvent(event) {
        if (!event.hasOwnProperty("type")) {
            return;
        }
        if (event.type === "message") {
            var messageEvent = event;
            if (messageEvent.message.type === 'text') {
                const messageRes = new MessageTextResponse_1.MessageTextResponse(client, context);
                await messageRes.init();
                return await messageRes.replyMessage(messageEvent);
            }
            else if (messageEvent.message.type === "audio") {
                var audioEvent = messageEvent.message;
                const audioRes = new audio_response_1.AudioResponse(client, context);
                return await audioRes.replyMessage(messageEvent.replyToken, audioEvent);
                //TODO save audio to blob storage
            }
            else if (messageEvent.message.type === "file") {
                var fileEvent = messageEvent.message;
                const fileRes = new file_response_1.FileResponse(client, context);
                return await fileRes.replyMessage(messageEvent.replyToken, fileEvent);
            }
        }
        else if (event.type = "postback") {
            var postbackEvent = event;
            const postbackRes = new PostbackEvent_1.PostbackEvent(client, context);
            await postbackRes.init();
            return await postbackRes.replyMessage(postbackEvent);
        }
    }
};
exports.index = index;
