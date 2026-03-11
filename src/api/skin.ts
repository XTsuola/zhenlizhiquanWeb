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

export function getSkinDiyList() {
    return request({
        url: "/skinDiy/list",
        method: "get"
    });
}

export interface SkinDiyAddType {
    cardId: number | undefined
    name: string
    skill: string
    effect: string
    reason: string
    remark: string
}
export function skinDiyAdd(data: SkinDiyAddType) {
    return request({
        url: "/skinDiy/add",
        method: "post",
        data: data
    });
}
