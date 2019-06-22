class UserLog {
    constructor(id) {
        this.id = id;
        this.userId = ""
        this.questions = [];
        this.answers = [];
        this.feedBack = "none";
        this.input = [];
        this.elizaOut = "";
        this.createdAt = Date.now();
        this.updateAt = Date.now();
    }
}
module.exports = UserLog
