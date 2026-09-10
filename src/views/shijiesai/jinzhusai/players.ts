import { heroTable } from "@/data/heroData/index";
import { BRACKET_ROUNDS, getRoundOpponent, getStandingLabel, roster } from "./data";

/** 金主赛选手：签位 1–128，名单来自 data.ts（Excel 选手名单页） */

/** 名次：1=128强、2=64强、3=32强、4=16强、5=8强、6=殿军、7=季军、8=亚军、9=冠军 */
export type JinzhusaiLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 单局结果：1胜、2负、3胜无效、4负无效、5弃权 */
export type MatchGameResult = 1 | 2 | 3 | 4 | 5;

/** 一场系列赛（BO5–BO9，5–9 局） */
export type MatchSeries = MatchGameResult[];

export const LEVEL_LABELS: Record<JinzhusaiLevel, string> = {
  1: "128强",
  2: "64强",
  3: "32强",
  4: "16强",
  5: "8强",
  6: "殿军",
  7: "季军",
  8: "亚军",
  9: "冠军"
};

/** 英雄 id → 名称，heroList 对照用 */
export const HERO_NAME_BY_ID: Record<number, string> = {
  1: "百花歌者·熙",
  2: "狮王魂伴·查查",
  3: "明光圣母·伊萝莲",
  4: "死亡使者·蔻维克斯",
  5: "海之王女·莎尔玛",
  6: "狂兽魔尊·格拉塔娜",
  7: "No.0·空无",
  8: "月之枪·玉",
  9: "万物灵母·白处尊",
  10: "影弑·辛克斯",
  11: "咒法巨匠·格纳罗尔",
  12: "深渊苦痛·尤瑞艾莉",
  13: "百兽之王·格洛兰德",
  14: "凛冬女妖·瑟芮蕾",
  15: "帝国之盾·阿卡德",
  16: "万物宗师·洛",
  17: "掠夺者·摩根",
  18: "冰原狼人·赛可",
  19: "烈焰疾风·希拉",
  20: "鲜血伯爵·弗拉德三世",
  21: "诡谋术师·戴蒙",
  22: "极电剑·迅",
  23: "绝望之刃·列拉金",
  24: "术法秘使·朱贝",
  25: "烈焰领主·伊格纳",
  26: "残冬哀嚎·海佛烈克",
  27: "典狱长·萨卡斯特",
  28: "独眼王·布隆",
  29: "掠夺者·亚芬戴克斯",
  30: "生命工匠·布朗蒙多",
  31: "安黛因",
  32: "喵喵",
  33: "玉龙将军·冽",
  34: "守秘人·阿斯塔拉",
  35: "冬岛先祖·尤克",
  36: "泰山守卫·梅",
  37: "魔法教授·塞莱斯塔",
  38: "海湾领主·萨维丽娅",
  39: "走私船长·鲍维乌斯",
  40: "兽化战士·丹巴瓦尔",
  41: "血色先锋·瓦斯兰",
  42: "霜之痕·赛娜"
};

export function getHeroName(id: number): string {
  return HERO_NAME_BY_ID[id] || `${id}号英雄`;
}

const HERO_IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";

export function getHeroImg(id: number): string {
  const hero = heroTable.find((h) => h.id === id) as { img?: string } | undefined;
  return hero?.img ? HERO_IMG_PREFIX + hero.img : "";
}

/** 第 N 局对应顺位第 N 位；超出 4 个时循环（第5局=1号，第6局=2号…） */
export function getHeroIdByGame(heroList: number[], gameIndex: number): number | undefined {
  if (!heroList.length) return undefined;
  const hid = heroList[gameIndex % heroList.length];
  return hid || undefined;
}

export type HeroCount = {
  id: number;
  name: string;
  count: number;
};

/** 统计英雄顺位中各英雄出现次数，42 名英雄都会列出（未上场为 0） */
export function countHeroesFromHeroLists(heroLists: number[][]): HeroCount[] {
  const cnt: Record<number, number> = {};
  for (const id of Object.keys(HERO_NAME_BY_ID).map(Number)) {
    cnt[id] = 0;
  }
  for (const heroList of heroLists) {
    for (const hid of heroList) {
      if (!hid) continue;
      cnt[hid] = (cnt[hid] || 0) + 1;
    }
  }
  return Object.entries(cnt)
    .map(([id, count]) => {
      const hid = Number(id);
      return { id: hid, name: getHeroName(hid), count };
    })
    .sort((a, b) => b.count - a.count || a.id - b.id);
}

export type HeroUser = {
  id: number;
  name: string;
  /** 1-based 顺位 */
  slots: number[];
};

/** 指定选手名单中，使用该英雄的人及顺位 */
export function getHeroUsers(
  heroId: number,
  list: { id: number; name: string; heroList: number[] }[]
): HeroUser[] {
  const out: HeroUser[] = [];
  for (const p of list) {
    const slots: number[] = [];
    p.heroList.forEach((hid, i) => {
      if (hid === heroId) slots.push(i + 1);
    });
    if (slots.length) out.push({ id: p.id, name: p.name, slots });
  }
  return out;
}

export type HeroWinStat = {
  id: number;
  name: string;
  win: number;
  lose: number;
  total: number;
  rate: number | null;
};

/** 按对局详情计英雄胜率：第 N 局对应顺位第 N 位；只计 1胜/2负，3/4/5 不计入 */
export function calcHeroWinRates(): HeroWinStat[] {
  const stats: Record<number, { win: number; lose: number }> = {};
  for (const id of Object.keys(HERO_NAME_BY_ID).map(Number)) {
    stats[id] = { win: 0, lose: 0 };
  }
  for (const p of roster) {
    for (const round of BRACKET_ROUNDS) {
      const rec = p.rounds[round];
      if (!rec?.results.length) continue;
      rec.results.forEach((code, i) => {
        const hid = getHeroIdByGame(p.heroList, i);
        if (!hid || !stats[hid]) return;
        if (code === 1) stats[hid].win += 1;
        else if (code === 2) stats[hid].lose += 1;
      });
    }
  }
  return Object.keys(HERO_NAME_BY_ID)
    .map(Number)
    .map((id) => {
      const { win, lose } = stats[id] || { win: 0, lose: 0 };
      const total = win + lose;
      return {
        id,
        name: getHeroName(id),
        win,
        lose,
        total,
        rate: total ? win / total : null
      };
    })
    .sort((a, b) => {
      if (a.rate == null && b.rate != null) return 1;
      if (a.rate != null && b.rate == null) return -1;
      if (a.rate != null && b.rate != null && a.rate !== b.rate) return b.rate - a.rate;
      if (b.total !== a.total) return b.total - a.total;
      return a.id - b.id;
    });
}

export type HeroMatchLog = {
  round: (typeof BRACKET_ROUNDS)[number];
  game: number;
  playerId: number;
  playerName: string;
  opponentId: number | null;
  opponentName: string;
  opponentHeroId: number | null;
  opponentHeroName: string;
  result: 1 | 2;
};

/** 某英雄所有有效对局（1胜/2负），含对手 */
export function getHeroMatchLogs(heroId: number): HeroMatchLog[] {
  const logs: HeroMatchLog[] = [];
  for (const p of roster) {
    for (const round of BRACKET_ROUNDS) {
      const rec = p.rounds[round];
      if (!rec?.results.length) continue;
      rec.results.forEach((code, i) => {
        if (getHeroIdByGame(p.heroList, i) !== heroId) return;
        if (code !== 1 && code !== 2) return;
        const opp = getRoundOpponent(p.id, round);
        const oppHeroId = opp ? getHeroIdByGame(opp.heroList, i) ?? null : null;
        logs.push({
          round,
          game: i + 1,
          playerId: p.id,
          playerName: p.name,
          opponentId: opp?.id ?? null,
          opponentName: opp?.name || "未知对手",
          opponentHeroId: oppHeroId,
          opponentHeroName: oppHeroId ? getHeroName(oppHeroId) : "—",
          result: code
        });
      });
    }
  }
  return logs;
}

export const RACE_LIST = [
  { id: 1, name: "帝国", color: "#e69500" },
  { id: 2, name: "隐秘", color: "#8a2be2" },
  { id: 3, name: "禅意", color: "#2e8b57" },
  { id: 4, name: "港口", color: "#1a6fa5" },
  { id: 5, name: "炼狱", color: "#c01b10" },
  { id: 6, name: "蛮石", color: "#8b5a2b" },
  { id: 7, name: "冬神", color: "#0290b5" }
] as const;

export type RaceCount = {
  id: number;
  name: string;
  color: string;
  count: number;
};

/** 统计英雄顺位中主、副种族出现次数 */
export function countRacesFromHeroLists(heroLists: number[][]): RaceCount[] {
  const cnt: Record<number, number> = {};
  for (const heroList of heroLists) {
    for (const hid of heroList) {
      const hero = heroTable.find((h) => h.id === hid) as { zhu: number; fu: number } | undefined;
      if (!hero) continue;
      cnt[hero.zhu] = (cnt[hero.zhu] || 0) + 1;
      cnt[hero.fu] = (cnt[hero.fu] || 0) + 1;
    }
  }
  return RACE_LIST.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    count: cnt[r.id] || 0
  })).sort((a, b) => b.count - a.count || a.id - b.id);
}

const TIANLONG_RACE_IDS = [4, 5, 7];

export type PlayerRaceTag = {
  id: string | number;
  label: string;
  color: string;
};

/** 主副种族合计：单种族 ≥3 为该种族玩家；冬神+港口+炼狱 ≥5 为天龙玩家（天龙标签置顶） */
export function getHeroRaceTags(heroList: number[]): PlayerRaceTag[] {
  const cnt: Record<number, number> = {};
  for (const hid of heroList) {
    const hero = heroTable.find((h) => h.id === hid) as { zhu: number; fu: number } | undefined;
    if (!hero) continue;
    cnt[hero.zhu] = (cnt[hero.zhu] || 0) + 1;
    cnt[hero.fu] = (cnt[hero.fu] || 0) + 1;
  }
  const tags: PlayerRaceTag[] = RACE_LIST.filter((r) => (cnt[r.id] || 0) >= 3)
    .sort((a, b) => (cnt[b.id] || 0) - (cnt[a.id] || 0))
    .map((r) => ({
      id: r.id,
      label: `${r.name}玩家`,
      color: r.color
    }));
  const tianlongCount = TIANLONG_RACE_IDS.reduce((sum, id) => sum + (cnt[id] || 0), 0);
  if (tianlongCount >= 5) {
    tags.unshift({
      id: "tianlong",
      label: "天龙玩家",
      color: "#b45309"
    });
  }
  return tags;
}

export function isTianlongPlayer(heroList: number[]): boolean {
  return getHeroRaceTags(heroList).some((t) => t.id === "tianlong");
}

export function countTianlongPlayers(heroLists: number[][]): number {
  return heroLists.reduce((n, list) => n + (isTianlongPlayer(list) ? 1 : 0), 0);
}

export type JinzhusaiPlayer = {
  id: number;
  name: string;
  /** 战力，保留两位小数 */
  zhanli: number;
  /** 名次，1–9 */
  level: JinzhusaiLevel;
  /** 英雄顺位，对照英雄 id */
  heroList: number[];
  /** 晋级胜场，每项一场系列赛（5–9 局） */
  data: MatchSeries[];
};

const STANDING_TO_LEVEL: Record<string, JinzhusaiLevel> = {
  "128强": 1,
  "64强": 2,
  "32强": 3,
  "16强": 4,
  "8强": 5,
  "半决赛": 6,
  "殿军": 6,
  "季军": 7,
  "决赛": 8,
  "亚军": 8,
  "冠军": 9
};

export const players: JinzhusaiPlayer[] = roster.map((r) => ({
  id: r.id,
  name: r.name,
  zhanli: Number(r.zhanli.toFixed(2)),
  level: STANDING_TO_LEVEL[getStandingLabel(r)] ?? 1,
  heroList: r.heroList,
  data: BRACKET_ROUNDS.map((k) => r.rounds[k]?.results).filter((x): x is number[] => !!x?.length) as MatchSeries[]
}));

export function getPlayerName(id: number): string {
  return players[id - 1]?.name || `${id}号选手`;
}

export function getPlayerZhanli(id: number): number {
  const v = players[id - 1]?.zhanli;
  return Number.isFinite(v) ? Number(Number(v).toFixed(2)) : 0;
}

export type PlayerSlotInfo = {
  id: number;
  name: string;
  zhanli: number;
  heroList: number[];
};

export function getPlayerSlot(id: number): PlayerSlotInfo {
  const p = players[id - 1];
  if (!p) return { id, name: `${id}号选手`, zhanli: 0, heroList: [] };
  return {
    id: p.id,
    name: p.name,
    zhanli: Number(Number(p.zhanli).toFixed(2)),
    heroList: p.heroList
  };
}

export function getPlayer(id: number): JinzhusaiPlayer | undefined {
  return players[id - 1];
}
