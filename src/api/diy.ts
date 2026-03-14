import request from "../utils/request";

export function getSkinDiyList() {
    return request({
        url: "/skinDiy/list",
        method: "get"
    });
}

export interface SkinDiyAddType {
    id?: number
    cardId: any
    name: string
    skill: string
    effect: string
    reason: string
    remark: string
    password?: string
}
export function skinDiyAdd(data: SkinDiyAddType) {
    return request({
        url: "/skinDiy/add",
        method: "post",
        data: data
    });
}

export function skinDiyUpdateTemp(data: SkinDiyAddType) {
    return request({
        url: "/skinDiy/updateTemp",
        method: "post",
        data: data
    });
}

export function skinDiyUpdate(data: SkinDiyAddType) {
    return request({
        url: "/skinDiy/update",
        method: "post",
        data: data
    });
}

export function getCardDiyList() {
    return request({
        url: "/cardDiy/list",
        method: "get"
    });
}

export interface CardDiyAddType {
    id?: number
    zhenyin: number | undefined
    name: string
    cost: number | undefined
    quality: number | undefined
    att: number | undefined
    life: number | undefined
    effect: string
    info: string
    remark: string
    password?: string
}
export function cardDiyAdd(data: CardDiyAddType) {
    return request({
        url: "/cardDiy/add",
        method: "post",
        data: data
    });
}

export function cardDiyUpdateTemp(data: CardDiyAddType) {
    return request({
        url: "/cardDiy/updateTemp",
        method: "post",
        data: data
    });
}

export function cardDiyUpdate(data: CardDiyAddType) {
    return request({
        url: "/cardDiy/update",
        method: "post",
        data: data
    });
}