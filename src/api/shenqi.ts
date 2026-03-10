import request from "../utils/request";

export function getShenqiList(zhenyin: number) {
    return request({
        url: "/shenqi/list?zhenyin=" + zhenyin,
        method: "get"
    });
}