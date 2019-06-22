class GeneralReply {
    GetFailureReply() {
        const announceCommenet = this.GetFacilityURL();
        const massage = "ごめんね。今はまだ分からないの。\n よかったら、ここに相談してみて。"  + announceCommenet;
        return massage;
    }

    GetFacilityURL() {
        const comment = "精華町の子育て応援サイトです。"
        const url = "http://www2.town.seika.kyoto.jp/kosodate/";
        return comment + "\n" + url;
    }

    GetRequestAgain() {
        const comment = "ごめんね。質問の内容を忘れちゃったので、もう一回話してちょうだい。";
        return comment;
    }

    GetEndGreeting() {
        const comment = "お役に立てよかったわ。また、気軽に聞いてね";
        return comment;
    }

    GetErrorMessage() {
        const commnet = "ごめんね。なんか調子悪いみたい。また後で話しかけてみてね。";
        return commnet;
    }
}
module.exports = GeneralReply