"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Eliza_1 = require("./Eliza/Eliza");
const index = async function (context, myTimer) {
    try {
        const eliza = new Eliza_1.Eliza(context);
        const elizaRes = await eliza.GetAnswer("Hello World");
        context.log("[Timer] success");
    }
    catch (err) {
        context.log("[Timer] Error Occured ");
        context.log(err);
    }
};
exports.index = index;
