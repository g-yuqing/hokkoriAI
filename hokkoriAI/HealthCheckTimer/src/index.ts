import { AzureFunction, Context } from "@azure/functions";
import { Eliza } from "./Eliza/Eliza";
import { QnaMaker } from "./qnaMaker/QnaMaker";

const index: AzureFunction = async function (context: Context, myTimer: any) {
  try {
    const eliza = new Eliza(context)
    const elizaRes = await eliza.GetAnswer("Hello World");
    const qnaMaker = new QnaMaker(context)
    const qnaRes = await qnaMaker.GetQnaAnswer("Hello World");

    context.log("[Timer] success");
  } catch (err) {
    context.log("[Timer] Error Occured ");
    context.log(err);
  }
}

export { index };
