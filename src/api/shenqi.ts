import { get } from "../utils/request";

/** 获取神器 */
export const getShenqiList = (zhenyin: number) => get("/shenqi/list", { zhenyin });
