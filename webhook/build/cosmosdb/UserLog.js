"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserLog {
    constructor(id) {
        this.userId = "";
        this.questions = [];
        this.answers = [];
        this.feedback = "none";
        this.input = [];
        this.createdAt = Date.now();
        this.updateAt = Date.now();
        this.id = id;
    }
}
exports.UserLog = UserLog;
