import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as Line from "@line/bot-sdk";
import * as LineTypes from "@line/bot-sdk/lib/types";
import { FileResponse } from "./file-response";
import { AudioResponse } from "./audio-response";
import { MessageTextResponse } from "./MessageTextResponse";
import { PostbackEvent } from "./PostbackEvent";

const config: Line.ClientConfig = {
  channelAccessToken: process.env.ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET!,
};
const client = new Line.Client(config);

const index: AzureFunction = async function (context: Context, req: HttpRequest) {
  context.log('JavaScript HTTP trigger function processed a request.');
  if (!req.body || !req.body.events) {
    context.res = {
      status: 400,
      body: 'Please access a properly way.'
    }
    context.done();
  } else {
    context.log(req.body.events);
    await Promise.all(req.body.events.map(handleEvent))
    context.res = { body: '' }
    context.done();
  }

  async function handleEvent(event: LineTypes.WebhookEvent): Promise<void> {
    if (event.type === "message") {
      var messageEvent = event as LineTypes.MessageEvent;
      if (messageEvent.message.type === 'text') {
        const messageRes = new MessageTextResponse(client, context);
        await messageRes.init();
        return await messageRes.replyMessage(event);
      } else if (messageEvent.message.type === "audio") {
        var audioEvent = event.message as LineTypes.AudioEventMessage;
        const audioRes = new AudioResponse(client, context);
        return await audioRes.replyMessage(event.replyToken, audioEvent);
        //TODO save audio to blob storage
      } else if (messageEvent.message.type === "file") {
        var fileEvent = event.message as LineTypes.FileEventMessage;
        const fileRes = new FileResponse(client, context);
        return await fileRes.replyMessage(event.replyToken, fileEvent);
      }
    } else if (event.type = "postback") {
      var postbackEvent = event as LineTypes.PostbackEvent;
      const postbackRes = new PostbackEvent(client, context);
      await postbackRes.init();
      return await postbackRes.replyMessage(postbackEvent);
    }
  }
}

export { index };
