class GeneralReply {
    static GetFailureReply(): string {
        const message = "ごめんね。今はまだ分からないことが多いの。もっと勉強するね。";
        return message;
    }

    static GetFacilityURL(): string {
        const comment = "精華町の子育て応援サイトです。"
        const url = "http://www2.town.seika.kyoto.jp/kosodate/";
        return comment + "\n" + url;
    }

    static GetRequestAgain(): string {
        const comment = "ごめんね。質問の内容を忘れちゃったので、もう一回話してちょうだい。";
        return comment;
    }

    static GetEndGreeting(): string {
        const comment = "お役に立てよかったわ。また、気軽に聞いてね";
        return comment;
    }

    static GetUnsatisfiedMessage(): string {
        const comment = "お役に立てなくてごめんなさい。";
        return comment;
    }

    static GetPleaseAskAgain(): string {
        const comment = "よかったら、また話しかけてね。";
        return comment;
    }

    static GetErrorMessage(): string {
        const commnet = "ごめんね。なんか調子悪いみたい。また後で話しかけてみてね。";
        return commnet;
    }
}

export { GeneralReply }