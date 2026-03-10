import request from "../utils/request";

// 获取访客留言信息
export function getNoteList() {
    return request({
        url: "/note/list",
        method: "get"
    })
};

// 添加留言
export interface NoteAddType {
    id?: number
    name: string
    title: string
    time: string
    content: string
};

export function noteAdd(data: NoteAddType) {
    return request({
        url: "/note/add",
        method: "post",
        data: data
    })
};

// 删除访客留言
export function noteDelete(id: string) {
    return request({
        url: "/note/delete?id=" + id,
        method: "delete"
    })
};
