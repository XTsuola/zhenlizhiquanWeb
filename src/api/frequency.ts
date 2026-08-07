import { get, post, del } from "../utils/request";

export interface FrequencyAddType {
  name: string;
  qu: number;
  heroId: number;
  heroLife: number;
  cards: string;
  time: string;
}

export interface FrequencyUpdateType {
  id: number;
  name: string;
  qu: number;
  heroId: number;
  heroLife: number;
  cards: string;
  time: string;
  password: string;
}

/** 新增卡组 */
export const frequencyAdd = (data: FrequencyAddType) => post("/frequency/cardsAdd", data);

/** 修改卡组 */
export const frequencyUpdate = (data: FrequencyUpdateType) => post("/frequency/cardsUpdate", data);

/** 临时修改卡组 */
export const frequencyUpdateTemp = (data: FrequencyUpdateType) => post("/frequency/cardsUpdateTemp", data);

/** 获取卡组详情 */
export const getFrequencyCardsDetail = (id: number) => get("/frequency/cardsDetail", { id });

/** 获取所有卡组 */
export const getFrequencyCardsAll = () => get("/frequency/cardsAll");

/** 删除卡组 */
export const frequencyDelete = (params: any) => del("/frequency/cardsDelete", params);

/** 新增临时密码 */
export const frequencyPasswordAdd = (data: any) => post("/frequency/passwordAdd", data);

/** 获取临时密码 */
export const getFrequencyPasswordList = () => get("/frequency/passwordList");

/** 删除临时密码 */
export const frequencyPasswordDelete = (id: number) => del("/frequency/passwordDelete", { id });
