import * as LineTypes from "@line/bot-sdk/lib/types";
import {MidwifeRequestInfoData} from "../Types/types";

class MidwifeInfo {
    id: Number
    midwifeName: string
    supportArea: string
    supportTime: string
    lineId: string
    lineUrl: string
    message: string
    deleteFlag: Number
    createdAt: Date
    updateAt: Date

    constructor(json: { [key: string]: any; }) {
        this.id = json["id"]
        this.midwifeName = json["midwife_name"]
        this.supportArea = json["support_area"]
        this.supportTime = json["support_time"]
        this.lineId = json["line_id"]
        this.lineUrl = json["line_url"]
        this.message = json["message"]
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

    GenerateTemplateColumn(): LineTypes.TemplateColumn {
        var info: MidwifeRequestInfoData = {
            kind: "midwiferequestfino",
            lineid: `${this.lineId}`,
            midwife_name: `${this.midwifeName}`,
        };

        var actions: LineTypes.Action[] = [
            {
                type: "postback",
                label: "この方のLINE IDを見る",
                data: `${JSON.stringify(info)}`,
                displayText: `${info.midwife_name}さん`,
            },
        ];

        var column: LineTypes.TemplateColumn = {
            title: `${this.midwifeName}`,
            text: `${this.message}`,
            actions: actions
        }

        return column;
    }
}

export { MidwifeInfo }
