import { get } from "../utils/request";

/** 新增日志 */
export const logAdd = (name: string) => get("/log/add", { name });

/** 获取日志 */
export const logList = () => get("/log/list");
