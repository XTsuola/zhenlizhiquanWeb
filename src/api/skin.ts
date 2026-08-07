import { get } from "../utils/request";

/** 获取皮肤 */
export const getSkinList = () => get("/skin/list");
