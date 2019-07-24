class MidwifeInfo {
    id: Number
    midwifeName: string
    supportArea: string
    lineId: string
    lineUrl: string
    deleteFlag: Number
    createdAt: Date
    updateAt: Date

    constructor(json: { [key: string]: any; }) {
        this.id = json["id"]
        this.midwifeName = json["midwife_name"]
        this.supportArea = json["support_area"]
        this.lineId = json["line_id"]
        this.lineUrl = json["line_url"]
        this.deleteFlag = json["delete_flag"]
        this.createdAt = json["created_at"]
        this.updateAt = json["update_at"]
    }

    GenerateAnnouncementString(): string {
        var result = "";
        result += this.midwifeName + "さんです。\n";
        result += this.supportArea + "を担当されています。\n"
        result += "よかったら、こちらから友達登録してみてね。\n"
        result += "LINE ID: " + this.lineId + "\n"
        result += this.lineUrl

        return result;
    }
}

export { MidwifeInfo }
