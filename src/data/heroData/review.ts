/** 英雄评测分数：1 白 · 2 蓝 · 3 紫 · 4 橙 · 5 红 */
export const HERO_SCORE_MIN = 1;
export const HERO_SCORE_MAX = 5;

export type HeroScore = 1 | 2 | 3 | 4 | 5;

export const SCORE_COLORS: Record<HeroScore, string> = {
    1: "#9ca3af",
    2: "#4f9bc4",
    3: "#8e488e",
    4: "#e67e22",
    5: "#c01b10"
};

export const SCORE_LABELS: Record<HeroScore, string> = {
    1: "白",
    2: "蓝",
    3: "紫",
    4: "橙",
    5: "红"
};

export const REVIEW_AXES = [
    { key: "dungeon", label: "地城/战役", short: "地城" },
    { key: "pvp", label: "PVP/世界赛", short: "PVP" },
    { key: "boss", label: "BOSS", short: "BOSS" },
    { key: "growth", label: "养成容易度", short: "养成" },
    { key: "sample", label: "样本数", short: "样本" }
] as const;

export type ReviewAxisKey = (typeof REVIEW_AXES)[number]["key"];

export interface HeroReviewScores {
    dungeon: HeroScore;
    pvp: HeroScore;
    boss: HeroScore;
    growth: HeroScore;
}

export interface HeroReviewItem extends Partial<HeroReviewScores> {
    /** 与英雄列表 id 一致 */
    id: number;
    /** 简评 */
    text?: string;
}

/**
 * 四个未评测维度在这里填，分数只能是 1 2 3 4 5（1白 2蓝 3紫 4橙 5红）。
 * dungeon=地城/战役  pvp=PVP/世界赛  boss=BOSS  growth=养成容易度（越高越容易）
 * 样本不用填。text 是简评，可不写。
 * 用法：复制一行，去掉前面的 //，把 3 改成你的分数。
 */
export const heroReviews: HeroReviewItem[] = [
    { id: 1, dungeon: 3, pvp: 4, boss: 2, growth: 4, text: "" }, // 百花歌者·熙
    { id: 2, dungeon: 4, pvp: 4, boss: 3, growth: 5, text: "" }, // 狮王魂伴·查查
    { id: 3, dungeon: 5, pvp: 5, boss: 5, growth: 1, text: "" }, // 明光圣母·伊萝莲
    { id: 4, dungeon: 4, pvp: 5, boss: 1, growth: 1, text: "" }, // 死亡使者·蔻维克斯
    { id: 5, dungeon: 5, pvp: 5, boss: 1, growth: 3, text: "" }, // 海之王女·莎尔玛
    { id: 6, dungeon: 4, pvp: 4, boss: 3, growth: 3, text: "" }, // 狂兽魔尊·格拉塔娜
    { id: 7, dungeon: 3, pvp: 4, boss: 4, growth: 2, text: "" }, // No.0·空无
    { id: 8, dungeon: 2, pvp: 3, boss: 2, growth: 2, text: "" }, // 月之枪·玉
    { id: 9, dungeon: 4, pvp: 3, boss: 3, growth: 5, text: "" }, // 万物灵母·白处尊
    { id: 10, dungeon: 3, pvp: 2, boss: 1, growth: 3, text: "" }, // 影弑·辛克斯
    { id: 11, dungeon: 4, pvp: 4, boss: 3, growth: 3, text: "" }, // 咒法巨匠·格纳罗尔
    { id: 12, dungeon: 3, pvp: 2, boss: 5, growth: 2, text: "" }, // 深渊苦痛·尤瑞艾莉
    { id: 13, dungeon: 4, pvp: 5, boss: 3, growth: 3, text: "" }, // 百兽之王·格洛兰德
    { id: 14, dungeon: 3, pvp: 3, boss: 2, growth: 1, text: "" }, // 凛冬女妖·瑟芮蕾
    { id: 15, dungeon: 4, pvp: 4, boss: 2, growth: 1, text: "" }, // 帝国之盾·阿卡德
    { id: 16, dungeon: 3, pvp: 3, boss: 5, growth: 2, text: "" }, // 万物宗师·洛
    { id: 17, dungeon: 4, pvp: 4, boss: 5, growth: 2, text: "" }, // 掠夺者·摩根
    { id: 18, dungeon: 4, pvp: 4, boss: 1, growth: 1, text: "" }, // 冰原狼人·赛可
    { id: 19, dungeon: 3, pvp: 3, boss: 2, growth: 3, text: "" }, // 烈焰疾风·希拉
    { id: 20, dungeon: 4, pvp: 4, boss: 4, growth: 2, text: "" }, // 鲜血伯爵·弗拉德三世
    { id: 21, dungeon: 3, pvp: 4, boss: 1, growth: 1, text: "" }, // 诡谋术师·戴蒙
    { id: 22, dungeon: 4, pvp: 4, boss: 3, growth: 5, text: "" }, // 极电剑·迅
    { id: 23, dungeon: 3, pvp: 4, boss: 1, growth: 1, text: "" }, // 绝望之刃·列拉金
    { id: 24, dungeon: 4, pvp: 4, boss: 5, growth: 2, text: "" }, // 术法秘使·朱贝
    { id: 25, dungeon: 4, pvp: 4, boss: 3, growth: 3, text: "" }, // 烈焰领主·伊格纳
    { id: 26, dungeon: 3, pvp: 2, boss: 2, growth: 1, text: "" }, // 残冬哀嚎·海佛烈克
    { id: 27, dungeon: 3, pvp: 3, boss: 4, growth: 1, text: "" }, // 典狱长·萨卡斯特
    { id: 28, dungeon: 4, pvp: 4, boss: 3, growth: 1, text: "" }, // 独眼王·布隆
    { id: 29, dungeon: 5, pvp: 4, boss: 3, growth: 3, text: "" }, // 掠夺者·亚芬戴克斯
    { id: 30, dungeon: 5, pvp: 3, boss: 5, growth: 3, text: "" }, // 生命工匠·布朗蒙多
    { id: 31, dungeon: 3, pvp: 2, boss: 2, growth: 1, text: "" }, // 安黛因
    { id: 32, dungeon: 4, pvp: 2, boss: 4, growth: 1, text: "" }, // 喵喵
    { id: 33, dungeon: 4, pvp: 4, boss: 2, growth: 3, text: "" }, // 玉龙将军·冽
    { id: 34, dungeon: 5, pvp: 4, boss: 5, growth: 3, text: "" }, // 守秘人·阿斯塔拉
    { id: 35, dungeon: 3, pvp: 4, boss: 1, growth: 2, text: "" }, // 冬岛先祖·尤克
    { id: 36, dungeon: 3, pvp: 3, boss: 3, growth: 5, text: "" }, // 泰山守卫·梅
    { id: 37, dungeon: 4, pvp: 4, boss: 3, growth: 3, text: "" }, // 魔法教授·塞莱斯塔
    { id: 38, dungeon: 5, pvp: 5, boss: 3, growth: 4, text: "" }, // 海湾领主·萨维丽娅
    { id: 39, dungeon: 4, pvp: 2, boss: 2, growth: 3, text: "" }, // 走私船长·鲍维乌斯
    { id: 40, dungeon: 5, pvp: 3, boss: 5, growth: 3, text: "" }, // 兽化战士·丹巴瓦尔
    { id: 41, dungeon: 4, pvp: 5, boss: 1, growth: 2, text: "" }, // 血色先锋·瓦斯兰
    { id: 42, dungeon: 2, pvp: 2, boss: 2, growth: 1, text: "" } // 霜之痕·赛娜
];

export const heroReviewMap: Record<number, HeroReviewItem> = Object.fromEntries(
    heroReviews.map((item) => [item.id, item])
);

export function clampScore(n: number): HeroScore {
    if (n <= 1) return 1;
    if (n >= 5) return 5;
    return Math.round(n) as HeroScore;
}

export function hasManualReview(item?: HeroReviewItem | null) {
    return !!(item && (item.dungeon || item.pvp || item.boss || item.growth || item.text));
}

/** 卡组分享数相对最高值换成 1–5；0 套为 1 分 */
export function sampleScoreFromCounts(count: number, allCounts: number[]): HeroScore {
    if (count <= 0) return 1;
    const max = Math.max(0, ...allCounts);
    if (max <= 0) return 1;
    const t = count / max;
    if (t >= 0.7) return 5;
    if (t >= 0.4) return 4;
    if (t >= 0.2) return 3;
    return 2;
}

export function scoreColor(score: number | null | undefined) {
    if (!score) return "#cbd5e1";
    return SCORE_COLORS[clampScore(score)];
}
