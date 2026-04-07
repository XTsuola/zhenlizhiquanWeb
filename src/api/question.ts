import request from "../utils/request";

// 获取每日问题列表
export function getQuestionList() {
    return request({
        url: "/question/list",
        method: "get"
    })
};

// 添加每日问题
export interface QuestionAddType {
    id?: number
    name: string
    time: string
    info: string
};

export function questionAdd(data: QuestionAddType) {
    return request({
        url: "/question/add",
        method: "post",
        data: data
    })
};

// 获取每日问题
export function questionDetail() {
    return request({
        url: "/question/detail",
        method: "get",
    })
};