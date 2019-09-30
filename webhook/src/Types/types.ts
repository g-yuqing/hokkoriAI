export type PostBackData = FeedbackData | QAConfirmData | MidwifeRequestInfoData | AskMidwifeData;

export type FeedbackData = {
    kind: "feedback";
    result: boolean;
};

export type QAConfirmData = {
    kind: "qaconfirm";
    result: boolean;
};

export type MidwifeRequestInfoData = {
    kind: "midwiferequestfino";
    midwife_name: string;
    lineid: string;
}

export type AskMidwifeData = {
    kind: "askmidwife";
    result: boolean;
}