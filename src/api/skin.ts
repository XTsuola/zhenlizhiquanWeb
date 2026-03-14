import request from "../utils/request";

export function getSkinList() {
    return request({
        url: "/skin/list",
        method: "get"
    });
}