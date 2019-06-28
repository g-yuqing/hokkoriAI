export type PostBackData = FeedbackData | QAConfirmData;

export type FeedbackData = {
    kind: "feedback";
    result: boolean;
};

export type QAConfirmData = {
    kind: "qaconfirm";
    result: boolean;
};