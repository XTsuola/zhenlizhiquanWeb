/**
 * 本地卡池备份（与后端 duel_card 种子一致）。
 * 实际对战以服务端 GET /duel/cards 与房间视角为准。
 */
export type UnitCard = {
    cost: number;
    name: string;
    att: number;
    life: number;
    effect: string;
    count: number;
};

export type FactionId = "renzu" | "mozu";

export const renzuData: UnitCard[] = [
    { cost: 2, name: "士兵", att: 2, life: 2, effect: "", count: 6 },
    { cost: 2, name: "战士", att: 3, life: 1, effect: "", count: 4 },
    { cost: 3, name: "骑兵", att: 4, life: 4, effect: "", count: 3 },
    { cost: 4, name: "剑圣", att: 7, life: 2, effect: "连击", count: 1 },
    { cost: 4, name: "法师", att: 5, life: 3, effect: "", count: 2 },
    { cost: 5, name: "火炮", att: 5, life: 8, effect: "", count: 2 },
    { cost: 6, name: "城堡", att: 11, life: 11, effect: "护甲1", count: 1 },
    { cost: 8, name: "国王", att: 15, life: 15, effect: "群体友军攻击+1，生命+1，获得践踏", count: 1 }
];

export const mozuData: UnitCard[] = [
    { cost: 2, name: "魔兵", att: 3, life: 1, effect: "", count: 6 },
    { cost: 2, name: "魔爪", att: 4, life: 1, effect: "", count: 4 },
    { cost: 3, name: "魔骑", att: 5, life: 3, effect: "", count: 3 },
    { cost: 4, name: "魔刃", att: 8, life: 1, effect: "践踏", count: 1 },
    { cost: 4, name: "术士", att: 6, life: 2, effect: "", count: 2 },
    { cost: 5, name: "魔炮", att: 6, life: 7, effect: "", count: 2 },
    { cost: 6, name: "魔塔", att: 12, life: 10, effect: "", count: 1 },
    { cost: 8, name: "魔王", att: 16, life: 14, effect: "群体友军攻击+5", count: 1 }
];
