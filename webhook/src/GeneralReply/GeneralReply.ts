class GeneralReply {
    static GetFailureReply(announceComment: string = this.GetFacilityURL()): string {
        const message = "ごめんね。今はまだ分からないの。\n よかったら、ここに相談してみて。\n"  + announceComment;
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

    static GetUnsatisfiedMessage(announceComment: string = this.GetFacilityURL()): string {
        const comment = "お役に立てなくてごめんなさい。\n  よかったら、ここに相談してみて。\n" + announceComment;
        return comment;
    }

    static GetErrorMessage(): string {
        const commnet = "ごめんね。なんか調子悪いみたい。また後で話しかけてみてね。";
        return commnet;
    }
}

export { GeneralReply }