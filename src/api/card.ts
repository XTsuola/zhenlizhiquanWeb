import request from "../utils/request";

export function getCardList(zhenyin: number) {
    return request({
        url: "/card/list?zhenyin=" + zhenyin,
        method: "get"
    });
}

export function getAllCardList() {
    return request({
        url: "/cardAll/list",
        method: "get"
    });
}

export interface UpdateCardGradeType {
    id: number
    grade: number[]
}
export function updateCardGrade(data: UpdateCardGradeType) {
    return request({
        url: "/card/gradeUpdate",
        method: "post",
        data: data
    });
}

export interface UpdateCardTagType {
    id: number
    tag: number[]
}
export function updateCardTag(data: UpdateCardTagType) {
    return request({
        url: "/card/tagUpdate",
        method: "post",
        data: data
    });
}
