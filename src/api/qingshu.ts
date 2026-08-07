import { get, post } from "../utils/request";

/** 获取游戏数据 */
export const getGameMap = () => get("/qingshu/getMap");

/** 重置游戏 */
export const resetGame = () => get("/qingshu/reset");

/** 获取卡牌 */
export const getCard = (userId: number) => get("/qingshu/getCard", { userId });

/** 弃牌 */
export const disCard = (data: any) => post("/qingshu/disCard", data);

/** 修改玩家名称 */
export const loginAndUpdateName = (data: any) => post("/qingshu/updateUsername", data);
