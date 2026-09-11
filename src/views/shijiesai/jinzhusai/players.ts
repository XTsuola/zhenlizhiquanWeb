import { heroTable } from "@/data/heroData/index";
import { BRACKET_ROUNDS, getRoundOpponent, getStandingLabel, reachedRound, roster } from "./data";

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

export type HeroAdvanceRow = {
  id: number;
  name: string;
  /** 与 BRACKET_ROUNDS 对齐：128 → 决赛 */
  counts: number[];
  /** 相对上一轮减少量；第一轮为 0 */
  drops: number[];
  unused: boolean;
};

/** 各轮仍在场选手的英雄顺位数量（128 强到决赛） */
export function calcHeroAdvanceTable(): { playerTotals: number[]; rows: HeroAdvanceRow[] } {
  const playerTotals = BRACKET_ROUNDS.map((round) => roster.filter((p) => reachedRound(p, round)).length);
  const countsByRound = BRACKET_ROUNDS.map((round) => {
    const lists = roster.filter((p) => reachedRound(p, round)).map((p) => p.heroList);
    return Object.fromEntries(countHeroesFromHeroLists(lists).map((h) => [h.id, h.count]));
  });
  const rows = Object.keys(HERO_NAME_BY_ID)
    .map(Number)
    .map((id) => {
      const counts = countsByRound.map((m) => m[id] || 0);
      const drops = counts.map((c, i) => (i === 0 ? 0 : counts[i - 1] - c));
      return { id, name: getHeroName(id), counts, drops, unused: counts[0] === 0 };
    })
    .sort((a, b) => {
      if (a.unused !== b.unused) return a.unused ? 1 : -1;
      for (let i = a.counts.length - 1; i >= 0; i--) {
        if (b.counts[i] !== a.counts[i]) return b.counts[i] - a.counts[i];
      }
      return a.id - b.id;
    });
  return { playerTotals, rows };
}

export function getPlayerGoldScore(p: Parameters<typeof getStandingLabel>[0]): number {
  const label = getStandingLabel(p);
  if (label === "冠军") return 10;
  if (label === "亚军") return 5;
  if (label === "决赛" || label === "半决赛" || label === "殿军" || label === "季军") return 3;
  if (label === "8强") return 2;
  if (label === "16强") return 1.5;
  if (label === "32强") return 1;
  return 0;
}

export type HeroGoldRow = {
  id: number;
  name: string;
  score: number;
  players: number;
};

export type HeroGoldContributor = {
  playerId: number;
  playerName: string;
  standing: string;
  score: number;
  slots: number[];
};

/** 按选手当前最高名次给 4 个顺位英雄加分，不累加前面轮次 */
export function calcHeroGoldTable(): HeroGoldRow[] {
  const stats: Record<number, { score: number; players: Set<number> }> = {};
  for (const id of Object.keys(HERO_NAME_BY_ID).map(Number)) {
    stats[id] = { score: 0, players: new Set() };
  }
  for (const p of roster) {
    const add = getPlayerGoldScore(p);
    if (!add) continue;
    for (const hid of p.heroList) {
      if (!hid || !stats[hid]) continue;
      stats[hid].score += add;
      stats[hid].players.add(p.id);
    }
  }
  return Object.keys(HERO_NAME_BY_ID)
    .map(Number)
    .map((id) => ({
      id,
      name: getHeroName(id),
      score: stats[id].score,
      players: stats[id].players.size
    }))
    .sort((a, b) => b.score - a.score || b.players - a.players || a.id - b.id);
}

export function getHeroGoldContributors(heroId: number): HeroGoldContributor[] {
  const out: HeroGoldContributor[] = [];
  for (const p of roster) {
    const unit = getPlayerGoldScore(p);
    if (!unit) continue;
    const slots: number[] = [];
    p.heroList.forEach((hid, i) => {
      if (hid === heroId) slots.push(i + 1);
    });
    if (!slots.length) continue;
    out.push({
      playerId: p.id,
      playerName: p.name,
      standing: getStandingLabel(p),
      score: unit * slots.length,
      slots
    });
  }
  return out.sort((a, b) => b.score - a.score || a.playerId - b.playerId);
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

export type HeroWinRateOptions = {
  /** 剔除双方同一局使用相同英雄的对局 */
  excludeMirror?: boolean;
};

/** 按对局详情计英雄胜率：第 N 局对应顺位第 N 位；只计 1胜/2负，3/4/5 不计入 */
export function calcHeroWinRates(opts: HeroWinRateOptions = {}): HeroWinStat[] {
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
        if (opts.excludeMirror) {
          const opp = getRoundOpponent(p.id, round);
          const oppHid = opp ? getHeroIdByGame(opp.heroList, i) : undefined;
          if (oppHid && oppHid === hid) return;
        }
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

export type HeroMatchupRow = {
  id: number | null;
  name: string;
  count: number;
};

export type HeroMatchupSummary = {
  win: HeroMatchupRow[];
  lose: HeroMatchupRow[];
};

/** 某英雄对其他英雄的胜/负场次汇总（不计内战：双方同一英雄） */
export function getHeroMatchupSummary(heroId: number, opts: HeroWinRateOptions = {}): HeroMatchupSummary {
  const winMap = new Map<number | "unknown", number>();
  const loseMap = new Map<number | "unknown", number>();
  for (const log of getHeroMatchLogs(heroId, { ...opts, excludeMirror: true })) {
    const key = log.opponentHeroId ?? "unknown";
    const map = log.result === 1 ? winMap : loseMap;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const toRows = (map: Map<number | "unknown", number>): HeroMatchupRow[] =>
    [...map.entries()]
      .map(([key, count]) =>
        key === "unknown"
          ? { id: null, name: "未知英雄", count }
          : { id: key, name: getHeroName(key), count }
      )
      .sort((a, b) => b.count - a.count || (a.id ?? 999) - (b.id ?? 999));
  return { win: toRows(winMap), lose: toRows(loseMap) };
}

/** 某英雄所有有效对局（1胜/2负），含对手 */
export function getHeroMatchLogs(heroId: number, opts: HeroWinRateOptions = {}): HeroMatchLog[] {
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
        if (opts.excludeMirror && oppHeroId === heroId) return;
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

function countRacesInHeroList(heroList: number[]): Record<number, number> {
  const cnt: Record<number, number> = {};
  for (const hid of heroList) {
    const hero = heroTable.find((h) => h.id === hid) as { zhu: number; fu: number } | undefined;
    if (!hero) continue;
    cnt[hero.zhu] = (cnt[hero.zhu] || 0) + 1;
    cnt[hero.fu] = (cnt[hero.fu] || 0) + 1;
  }
  return cnt;
}

/** 统计英雄顺位中主、副种族出现次数 */
export function countRacesFromHeroLists(heroLists: number[][]): RaceCount[] {
  const cnt: Record<number, number> = {};
  for (const heroList of heroLists) {
    const races = countRacesInHeroList(heroList);
    for (const [id, n] of Object.entries(races)) {
      const rid = Number(id);
      cnt[rid] = (cnt[rid] || 0) + n;
    }
  }
  return RACE_LIST.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    count: cnt[r.id] || 0
  })).sort((a, b) => b.count - a.count || a.id - b.id);
}

/** 4 个顺位英雄中，单种族主副合计 ≥3 计该种族玩家 +1；同一人可叠多个种族 */
export function countRacePlayersFromHeroLists(heroLists: number[][]): RaceCount[] {
  const cnt: Record<number, number> = {};
  for (const heroList of heroLists) {
    const races = countRacesInHeroList(heroList);
    for (const r of RACE_LIST) {
      if ((races[r.id] || 0) >= 3) {
        cnt[r.id] = (cnt[r.id] || 0) + 1;
      }
    }
  }
  return RACE_LIST.map((r) => ({
    id: r.id,
    name: `${r.name}玩家`,
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

/** 主副种族合计：单种族 ≥3 为该种族玩家；港口+炼狱+冬神 ≥5 天龙、≥7 大威天龙（大威置顶） */
export function getHeroRaceTags(heroList: number[]): PlayerRaceTag[] {
  const cnt = countRacesInHeroList(heroList);
  const tags: PlayerRaceTag[] = RACE_LIST.filter((r) => (cnt[r.id] || 0) >= 3)
    .sort((a, b) => (cnt[b.id] || 0) - (cnt[a.id] || 0))
    .map((r) => ({
      id: r.id,
      label: `${r.name}玩家`,
      color: r.color
    }));
  if (isTianlongPlayer(heroList)) {
    tags.unshift({
      id: "tianlong",
      label: "天龙玩家",
      color: "#b45309"
    });
  }
  if (isDaweiTianlongPlayer(heroList)) {
    tags.unshift({
      id: "dawei",
      label: "大威天龙",
      color: "#7c2d12"
    });
  }
  return tags;
}

function tianlongRaceCount(heroList: number[]): number {
  const cnt = countRacesInHeroList(heroList);
  return TIANLONG_RACE_IDS.reduce((n, id) => n + (cnt[id] || 0), 0);
}

export function isTianlongPlayer(heroList: number[]): boolean {
  return tianlongRaceCount(heroList) >= 5;
}

export function isDaweiTianlongPlayer(heroList: number[]): boolean {
  return tianlongRaceCount(heroList) >= 7;
}

export function countTianlongPlayers(heroLists: number[][]): number {
  return heroLists.reduce((n, list) => n + (isTianlongPlayer(list) ? 1 : 0), 0);
}

export function countDaweiTianlongPlayers(heroLists: number[][]): number {
  return heroLists.reduce((n, list) => n + (isDaweiTianlongPlayer(list) ? 1 : 0), 0);
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
