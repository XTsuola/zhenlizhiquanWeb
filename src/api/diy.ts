import { get, post } from "../utils/request";

export interface SkinDiyAddType {
    id?: number;
    cardId: any;
    name: string;
    skill: string;
    effect: string;
    reason: string;
    remark: string;
    password?: string;
}

export interface CardDiyAddType {
    id?: number;
    zhenyin: number | undefined;
    name: string;
    cardType: number | undefined;
    cost: number | undefined;
    quality: number | undefined;
    att: number | undefined;
    life: number | undefined;
    effect: string;
    info: string;
    remark: string;
    password?: string;
}

/** 获取许愿皮肤 */
export const getSkinDiyList = () => get("/skinDiy/list");

/** 新增许愿皮肤 */
export const skinDiyAdd = (data: SkinDiyAddType) => post("/skinDiy/add", data);

/** 临时修改许愿皮肤 */
export const skinDiyUpdateTemp = (data: SkinDiyAddType) => post("/skinDiy/updateTemp", data);

/** 修改许愿皮肤 */
export const skinDiyUpdate = (data: SkinDiyAddType) => post("/skinDiy/update", data);

/** 获取许愿卡牌 */
export const getCardDiyList = () => get("/cardDiy/list");

/** 新增许愿卡牌 */
export const cardDiyAdd = (data: CardDiyAddType) => post("/cardDiy/add", data);

/** 临时修改许愿卡牌 */
export const cardDiyUpdateTemp = (data: CardDiyAddType) => post("/cardDiy/updateTemp", data);

/** 修改许愿卡牌 */
export const cardDiyUpdate = (data: CardDiyAddType) => post("/cardDiy/update", data);
