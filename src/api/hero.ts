import { get, post } from "../utils/request";

/** 获取英雄 */
export const getHeroList = () => get("/hero/list");

/** 获取英雄碎片 */
export const getShardList = () => get("/hero/shardList");

/** 修改英雄碎片 */
export const updateShard = (data: any) => post("/hero/shardUpdate", data);

/** 修改代理人 */
export const addAgent = (data: any) => post("/hero/agentAdd", data);