"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GeneralReply {
    static GetFailureReply() {
        const announceComment = this.GetFacilityURL();
        const message = "ごめんね。今はまだ分からないの。\n よかったら、ここに相談してみて。\n" + announceComment;
        return message;
    }
    static GetFacilityURL() {
        const comment = "精華町の子育て応援サイトです。";
        const url = "http://www2.town.seika.kyoto.jp/kosodate/";
        return comment + "\n" + url;
    }
    static GetRequestAgain() {
        const comment = "ごめんね。質問の内容を忘れちゃったので、もう一回話してちょうだい。";
        return comment;
    }
    static GetEndGreeting() {
        const comment = "お役に立てよかったわ。また、気軽に聞いてね";
        return comment;
    }
    static GetUnsatisfiedMessage() {
        const announceComment = this.GetFacilityURL();
        const comment = "お役に立てなくてごめんなさい。\n  よかったら、ここに相談してみて。\n" + announceComment;
        return comment;
    }
    static GetErrorMessage() {
        const commnet = "ごめんね。なんか調子悪いみたい。また後で話しかけてみてね。";
        return commnet;
    }
}
exports.GeneralReply = GeneralReply;
