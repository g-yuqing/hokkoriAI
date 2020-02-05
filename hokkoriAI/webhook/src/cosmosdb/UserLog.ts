class UserLog {
    id: string;
    userId: string = "";
    inputStrings: Array<string> = [];
    estimateDate: string = "";
    estimateTime: string = "";
    confirmDate: string = "";
    confirmTime: string = "";
    recommendSupporters: Array<string> = [];
    selectedSupporter: string = "";
    createdAt: number = Date.now();
    updateAt: number = Date.now();
    state: string = "none"

    questions: Array<string> = [];
    answers: Array<string> = [];
    feedback: string = "none";
    // input: Array<string> = [];

    constructor(id: string) {
        this.id = id;
    }
}

export { UserLog };
