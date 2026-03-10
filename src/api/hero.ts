import request from "../utils/request";

export function getHeroList() {
    return request({
        url: "/hero/list",
        method: "get"
    });
}

export function getShardList() {
    return request({
        url: "/hero/shardList",
        method: "get"
    });
}

export function updateShard(data: any) {
    return request({
        url: "/hero/shardUpdate",
        method: "post",
        data: data
    });
}