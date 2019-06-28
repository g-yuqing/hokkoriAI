class UserLog {
    id: string;
    userId: string = "";
    questions: Array<string> = [];
    answers: Array<string> = [];
    feedback: string = "none";
    input: Array<string> = [];
    createdAt: number = Date.now();
    updateAt: number = Date.now();

    constructor(id: string) {
        this.id = id;
    }
}

export { UserLog };
