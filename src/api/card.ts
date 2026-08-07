import { get, post } from "../utils/request";

export interface UpdateCardGradeType {
    id: number;
    grade: number[];
}

export interface UpdateCardTagType {
    id: number;
    tag: number[];
}

/** 获取单个种族卡牌 */
export const getCardList = (zhenyin: number) => get("/card/list", { zhenyin }, { timeout: 0 });

/** 获取所有卡牌 */
export const getAllCardList = () => get("/cardAll/list", undefined, { timeout: 0 });

/** 修改卡牌评级 */
export const updateCardGrade = (data: UpdateCardGradeType) => post("/card/gradeUpdate", data);

/** 修改卡牌标签 */
export const updateCardTag = (data: UpdateCardTagType) => post("/card/tagUpdate", data);
