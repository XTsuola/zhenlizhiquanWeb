import request from "../utils/request";

export function logAdd(name: string) {
    return request({
        url: "/log/add?name=" + name,
        method: "get"
    });
}

export function logList() {
    return request({
        url: "/log/list",
        method: "get"
    });
}