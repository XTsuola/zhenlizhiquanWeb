import request from "../utils/request";

export interface FrequencyAddType {
    name: string
    qu: number
    heroId: number
    heroLife: number
    cards: string
    time: string
}
export function frequencyAdd(data: FrequencyAddType) {
    return request({
        url: "/frequency/cardsAdd",
        method: "post",
        data: data
    });
}

export interface FrequencyUpdateType {
    id: number
    name: string
    qu: number
    heroId: number
    heroLife: number
    cards: string
    time: string
    password: string
}
export function frequencyUpdate(data: FrequencyUpdateType) {
    return request({
        url: "/frequency/cardsUpdate",
        method: "post",
        data: data
    });
}

export function frequencyUpdateTemp(data: FrequencyUpdateType) {
    return request({
        url: "/frequency/cardsUpdateTemp",
        method: "post",
        data: data
    });
}

export function getFrequencyCardsDetail(id: number) {
    return request({
        url: "/frequency/cardsDetail?id=" + id,
        method: "get"
    });
}

export function getFrequencyCardsAll() {
    return request({
        url: "/frequency/cardsAll",
        method: "get"
    });
}

export function frequencyDelete(params: any) {
    return request({
        url: "/frequency/cardsDelete",
        method: "delete",
        params: params
    })
};

export function frequencyPasswordAdd(data: any) {
    return request({
        url: "/frequency/passwordAdd",
        method: "post",
        data: data
    });
}

export function getFrequencyPasswordList() {
    return request({
        url: "/frequency/passwordList",
        method: "get"
    });
}

export function frequencyPasswordDelete(id: number) {
    return request({
        url: "/frequency/passwordDelete?id=" + id,
        method: "delete"
    })
};
