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

// 获取每日问题+答案列表
export function getAnswerList(questionId: number | undefined) {
    return request({
        url: "/answer/list?questionId=" + questionId,
        method: "get"
    })
};

// 管理员获取所有答案列表
export function getAnswerAllList() {
    return request({
        url: "/answer/allList",
        method: "get"
    })
};

// 添加答案
export interface AnswerAddType {
    id?: number
    questionId: number | undefined
    name: string
    time: string
    content: string
};

export function answerAdd(data: AnswerAddType) {
    return request({
        url: "/answer/add",
        method: "post",
        data: data
    })
};