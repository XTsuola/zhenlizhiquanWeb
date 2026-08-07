import { get, post, del } from "../utils/request";

export interface XuanshouInfoType {
  name?: string;
  kedu?: number;
  hero: number[];
}

export interface SaveShijiesaiInfoType {
  id?: number;
  no: number;
  aInfo: XuanshouInfoType;
  bInfo: XuanshouInfoType;
  shengfuList: number[];
}

export interface ShijiesaiInfoListType {
  pageSize: number;
  pageNo: number;
  gameType: number;
}

/** 新增比赛 */
export const saveShijiesaiInfo = (data: SaveShijiesaiInfoType) => post("/shijiesai/add", data);

/** 修改比赛 */
export const updateShijiesaiInfo = (data: SaveShijiesaiInfoType) => post("/shijiesai/update", data);

/** 获取比赛列表 */
export const shijiesaiInfoList = (data: ShijiesaiInfoListType) => get("/shijiesai/list", data);

/** 删除比赛 */
export const shijiesaiDelete = (id: number) => del("/shijiesai/delete", { id });

/** 选择比赛 */
export const shijiesaiSelect = (type: number) => get("/shijiesai/select", { gameType: type });
