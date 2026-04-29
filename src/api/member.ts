import request from "../utils/request";

// 添加成员
export interface MemberAddType {
    id?: number
    name: string
    score: number | null
    title?: string
    remark?: string
};
export function memberAdd(data: MemberAddType) {
    return request({
        url: "/member/add",
        method: "post",
        data: data
    })
};

export function memberUpdate(data: MemberAddType) {
    return request({
        url: "/member/update/" + data.id + "/",
        method: "post",
        data: data
    })
};

// 获取成员列表
export function getMemberList() {
    return request({
        url: "/member/list",
        method: "get"
    });
}

// 删除成员
export function memberDelete(id: number) {
    return request({
        url: "/member/delete/" + id + "/",
        method: "delete"
    })
};