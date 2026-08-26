import { get, post } from "../utils/request";

/** 获取英雄 */
export const getHeroList = () => get("/hero/list");

/** 修改代理人 */
export const addAgent = (data: any) => post("/hero/agentAdd", data);