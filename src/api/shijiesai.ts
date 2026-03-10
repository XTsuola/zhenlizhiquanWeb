import request from "../utils/request";

export interface XuanshouInfoType {
    name?: string
    kedu?: number
    hero: number[]
}

export interface SaveShijiesaiInfoType {
    id?: number
    no: number
    aInfo: XuanshouInfoType
    bInfo: XuanshouInfoType
    shengfuList: number[]
}

export function saveShijiesaiInfo(data: SaveShijiesaiInfoType) {
    return request({
        url: "/shijiesai/add",
        method: "post",
        data: data
    });
}

export function updateShijiesaiInfo(data: SaveShijiesaiInfoType) {
    return request({
        url: "/shijiesai/update",
        method: "post",
        data: data
    });
}

export interface ShijiesaiInfoListType {
    pageSize: number
    pageNo: number
    gameType: number
}
export function shijiesaiInfoList(data: ShijiesaiInfoListType) {
    return request({
        url: "/shijiesai/list",
        method: "get",
        params: data
    });
}

export function shijiesaiDelete(id: number) {
    return request({
        url: "/shijiesai/delete?id=" + id,
        method: "delete"
    })
};

export function shijiesaiSelect(type: number) {
    return request({
        url: "/shijiesai/select?gameType=" + type,
        method: "get"
    });
}