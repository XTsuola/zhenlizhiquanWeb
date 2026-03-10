import request from "../utils/request";

export function getSkinList() {
    return request({
        url: "/skin/list",
        method: "get"
    });
}

export function skinTogether(params: any) {
    return request({
        url: "/skin/together",
        method: "post",
        data: params
    });
}