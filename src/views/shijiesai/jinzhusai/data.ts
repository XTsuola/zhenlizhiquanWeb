/** 金主赛选手名单：128 强来自「金主赛晋级图.xlsx」，64 强赛果来自「64强名单.xlsx」，32 强赛果来自「32强名单.xlsx」，16 强赛果来自「16强名单.xlsx」，8 强赛果来自「8强名单.xlsx」，半决赛赛果来自「4强名单.xlsx」，季军赛/决赛赛果来自「最终名单.xlsx」 */

/** 对阵轮次：128 → 64 → 32 → 16 → 8 → 半决赛 → 决赛 */
export const BRACKET_ROUNDS = ["128", "64", "32", "16", "8", "4", "final"] as const;
export type BracketRound = (typeof BRACKET_ROUNDS)[number] | "third";

export const BRACKET_ROUND_LABELS: Record<BracketRound, string> = {
  "128": "128强",
  "64": "64强",
  "32": "32强",
  "16": "16强",
  "8": "8强",
  "4": "半决赛",
  third: "季军赛",
  final: "决赛"
};

/** 单局：1胜 2负 3胜无效 4负无效 5弃权 */
export type RoundRecord = {
  results: number[];
  /** 本轮获胜，进入下一轮；决赛为冠军 */
  advanced: boolean;
};

export type RosterPlayer = {
  id: number;
  name: string;
  zhanli: number;
  /** 英雄顺位全程不变 */
  heroList: number[];
  /** 按轮次记录赛果，未打的轮次不写 */
  rounds: Partial<Record<BracketRound, RoundRecord>>;
};

export const RESULT_LABELS: Record<number, string> = {
  1: "胜",
  2: "负",
  3: "胜无效",
  4: "负无效",
  5: "弃权"
};

export const roster: RosterPlayer[] = [
  { id: 1, name: "170-阿源", zhanli: 1.61, heroList: [5, 4, 11, 23], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [2, 1, 2, 2, 2, 1, 1, 1, 2], advanced: false } } },
  { id: 2, name: "393-五五开仙人", zhanli: 0.43, heroList: [33, 9, 10, 42], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 3, name: "467-小助手", zhanli: 0.58, heroList: [30, 40, 36, 34], rounds: { "128": { results: [3, 1, 1, 2, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 4, name: "214-朔", zhanli: 0.42, heroList: [37, 2, 22, 9], rounds: { "128": { results: [4, 2, 2, 1, 4], advanced: false } } },
  { id: 5, name: "50-Mr", zhanli: 1.05, heroList: [3, 4, 11, 29], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 6, name: "349-游乐园", zhanli: 0.62, heroList: [5, 41, 4, 11], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 7, name: "43-闹笑话的绅士", zhanli: 1.18, heroList: [4, 3, 35, 7], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [1, 2, 1, 1, 1, 2, 2, 2, 1], advanced: true }, "16": { results: [1, 1, 1, 1, 2, 2, 2, 2, 1], advanced: true }, "8": { results: [1, 4, 1, 2, 1, 4, 2, 2], advanced: false } } },
  { id: 8, name: "310-鱼儿", zhanli: 0.47, heroList: [3, 34, 4, 36], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 9, name: "49-ZCY", zhanli: 1.26, heroList: [33, 4, 7, 17], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 3, 3, 4, 2, 3], advanced: true }, "32": { results: [1, 2, 3, 1, 2, 1, 3], advanced: true }, "16": { results: [2, 2, 2, 2, 1, 1, 1, 1, 2], advanced: false } } },
  { id: 10, name: "203-开摆", zhanli: 0.52, heroList: [30, 39, 22, 2], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 11, name: "417-建峰", zhanli: 0.62, heroList: [3, 34, 36, 25], rounds: { "128": { results: [4, 4, 1, 3, 4], advanced: false } } },
  { id: 12, name: "31-冰翼", zhanli: 0.66, heroList: [6, 13, 22, 5], rounds: { "128": { results: [3, 3, 2, 4, 3], advanced: true }, "64": { results: [2, 4, 4, 3, 1, 4], advanced: false } } },
  { id: 13, name: "117-不过须臾", zhanli: 1.1, heroList: [25, 3, 20, 1], rounds: { "128": { results: [2, 1, 1, 2, 2], advanced: false } } },
  { id: 14, name: "146-KB", zhanli: 1.17, heroList: [34, 3, 12, 16], rounds: { "128": { results: [1, 2, 2, 1, 1], advanced: true }, "64": { results: [3, 3, 1, 3], advanced: true }, "32": { results: [2, 1, 4, 2, 1, 2, 4], advanced: false } } },
  { id: 15, name: "354-洎信", zhanli: 0.78, heroList: [6, 37, 32, 22], rounds: { "128": { results: [1, 2, 2, 2, 2], advanced: false } } },
  { id: 16, name: "21-无名", zhanli: 1.14, heroList: [7, 4, 5, 13], rounds: { "128": { results: [2, 1, 1, 1, 1], advanced: true }, "64": { results: [4, 4, 2, 4], advanced: false } } },
  { id: 17, name: "69-伴宫星自", zhanli: 1.96, heroList: [5, 4, 7, 41], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [3, 3, 3, 3, 3], advanced: true }, "16": { results: [2, 2, 1, 3, 1, 1, 1], advanced: true }, "8": { results: [2, 3, 2, 1, 2, 3, 1, 1], advanced: true }, "4": { results: [2, 1, 2, 1, 2, 1, 2, 2], advanced: false }, third: { results: [2, 1, 2, 2, 2, 2], advanced: false } } },
  { id: 18, name: "436-苏幕", zhanli: 0.48, heroList: [31, 39, 18, 26], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 19, name: "296-听故事的人", zhanli: 0.64, heroList: [2, 3, 34, 22], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 20, name: "311-大黑鱼", zhanli: 0.68, heroList: [40, 39, 22, 37], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 21, name: "354-无语没话说", zhanli: 0.95, heroList: [11, 4, 41, 5], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 1, 1, 2, 1, 2, 1], advanced: true }, "32": { results: [4, 4, 4, 4, 4], advanced: false } } },
  { id: 22, name: "481-有事語音", zhanli: 0.58, heroList: [4, 35, 11, 41], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 23, name: "22-塔罗会愚者", zhanli: 1.02, heroList: [7, 27, 3, 40], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 2, 2, 1, 2, 1, 2], advanced: false } } },
  { id: 24, name: "350-随風", zhanli: 0.32, heroList: [3, 34, 29, 36], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 25, name: "206-电量不足", zhanli: 1.24, heroList: [5, 25, 3, 11], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 2, 2, 1, 1, 2], advanced: false } } },
  { id: 26, name: "505-何文", zhanli: 0.39, heroList: [22, 2, 37, 6], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 27, name: "119-逆天", zhanli: 0.96, heroList: [6, 13, 5, 1], rounds: { "128": { results: [1, 2, 1, 1, 1], advanced: true }, "64": { results: [1, 1, 1, 2, 2, 1], advanced: true }, "32": { results: [2, 1, 2, 1, 1, 2, 2, 1, 2], advanced: false } } },
  { id: 28, name: "166-顾圆", zhanli: 0.66, heroList: [6, 13, 39, 22], rounds: { "128": { results: [2, 1, 2, 2, 2], advanced: false } } },
  { id: 29, name: "27-热血战歌", zhanli: 1.34, heroList: [3, 34, 36, 14], rounds: { "128": { results: [1, 1, 3, 3, 1], advanced: true }, "64": { results: [1, 1, 1, 2, 1], advanced: true }, "32": { results: [1, 2, 1, 2, 2, 1, 1, 2, 1], advanced: true }, "16": { results: [1, 1, 2, 4, 2, 2, 2], advanced: false } } },
  { id: 30, name: "191-理解力", zhanli: 0.82, heroList: [6, 13, 37, 22], rounds: { "128": { results: [2, 2, 4, 4, 2], advanced: false } } },
  { id: 31, name: "129-旧城之下", zhanli: 1.46, heroList: [25, 15, 1, 13], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 2, 2, 1, 2], advanced: false } } },
  { id: 32, name: "40-黄海雍", zhanli: 0.69, heroList: [22, 19, 2, 4], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 33, name: "354-sky", zhanli: 0.76, heroList: [5, 1, 41, 11], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [1, 2, 1, 1, 2, 2, 1, 1], advanced: true }, "16": { results: [2, 4, 2, 1, 2, 4], advanced: false } } },
  { id: 34, name: "449-肥太狼", zhanli: 0.35, heroList: [38, 29, 34, 4], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 35, name: "277-橘子来了", zhanli: 0.43, heroList: [2, 22, 42, 10], rounds: { "128": { results: [2, 1, 2, 3, 1, 2, 1], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 36, name: "443-开", zhanli: 0.26, heroList: [9, 36, 34, 29], rounds: { "128": { results: [1, 2, 1, 4, 2, 1, 2], advanced: false } } },
  { id: 37, name: "292-舒适圈", zhanli: 0.95, heroList: [4, 33, 35, 7], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 2, 2, 1, 2], advanced: false } } },
  { id: 38, name: "489-Toki", zhanli: 0.25, heroList: [5, 41, 4, 8], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 39, name: "101-tristy", zhanli: 0.85, heroList: [3, 34, 36, 40], rounds: { "128": { results: [1, 1, 2, 4, 2, 2], advanced: false } } },
  { id: 40, name: "91-李果", zhanli: 1.27, heroList: [6, 13, 1, 37], rounds: { "128": { results: [2, 2, 1, 3, 1, 1], advanced: true }, "64": { results: [1, 1, 1, 2, 1], advanced: true }, "32": { results: [2, 1, 2, 2, 1, 1, 2, 2], advanced: false } } },
  { id: 41, name: "337-入眼", zhanli: 1, heroList: [4, 5, 11, 41], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 1, 1, 1], advanced: true }, "32": { results: [2, 1, 2, 2, 1, 2, 1, 1, 2], advanced: false } } },
  { id: 42, name: "46-漠溪", zhanli: 0.6, heroList: [15, 25, 20, 13], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 43, name: "26-狗宁", zhanli: 2.16, heroList: [33, 7, 4, 35], rounds: { "128": { results: [2, 2, 1, 2, 2], advanced: false } } },
  { id: 44, name: "190-神秘人物", zhanli: 0.86, heroList: [6, 13, 37, 22], rounds: { "128": { results: [1, 1, 2, 1, 1], advanced: true }, "64": { results: [2, 2, 2, 2], advanced: false } } },
  { id: 45, name: "397-独眼King", zhanli: 1.06, heroList: [4, 28, 35, 11], rounds: { "128": { results: [3, 2, 1, 1, 3], advanced: true }, "64": { results: [1, 2, 1, 2, 1, 2, 1], advanced: true }, "32": { results: [1, 2, 1, 1, 2, 1, 2, 2, 1], advanced: true }, "16": { results: [1, 3, 1, 2, 1, 3], advanced: true }, "8": { results: [2, 1, 1, 1, 1, 2, 1], advanced: true }, "4": { results: [1, 2, 1, 2, 1, 2, 1, 1], advanced: true }, final: { results: [1, 1, 2, 2, 1, 2, 2, 2], advanced: false } } },
  { id: 46, name: "118-風尘依旧", zhanli: 0.9, heroList: [3, 11, 11, 16], rounds: { "128": { results: [4, 1, 2, 2, 4], advanced: false } } },
  { id: 47, name: "69-卓一塑业", zhanli: 1.49, heroList: [5, 4, 41, 13], rounds: { "128": { results: [1, 1, 1, 1], advanced: true }, "64": { results: [2, 1, 2, 1, 2, 1, 2], advanced: false } } },
  { id: 48, name: "157-段", zhanli: 1.22, heroList: [4, 35, 11, 3], rounds: { "128": { results: [2, 2, 2, 2], advanced: false } } },
  { id: 49, name: "41-异界淘金者", zhanli: 1.34, heroList: [5, 4, 38, 41], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [3, 3, 3, 3, 3], advanced: true }, "16": { results: [2, 2, 1, 2, 1, 2, 1, 1, 3], advanced: true }, "8": { results: [1, 2, 2, 2, 2, 1, 2], advanced: false } } },
  { id: 50, name: "385-从前", zhanli: 0.27, heroList: [39, 2, 22, 30], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 51, name: "281-惊蛰", zhanli: 0.65, heroList: [4, 5, 41, 1], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 52, name: "385-搓搓", zhanli: 0.22, heroList: [40, 39, 30, 22], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 53, name: "481-星辰", zhanli: 0.64, heroList: [3, 4, 35, 7], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [4, 4, 4, 4, 4], advanced: false } } },
  { id: 54, name: "213-玄", zhanli: 0.37, heroList: [5, 41, 11, 1], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 55, name: "505-无情", zhanli: 0.33, heroList: [15, 5, 1, 19], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 56, name: "354-桐芯", zhanli: 0.38, heroList: [30, 22, 2, 39], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 57, name: "398-一只奶黄包", zhanli: 1.35, heroList: [3, 37, 32, 17], rounds: { "128": { results: [1, 1, 1, 1], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [1, 1, 2, 1, 2, 1, 1], advanced: true }, "16": { results: [1, 1, 2, 1, 2, 1, 2, 2, 4], advanced: false } } },
  { id: 58, name: "119-铁蛋", zhanli: 0.71, heroList: [3, 34, 36, 29], rounds: { "128": { results: [2, 2, 2, 2], advanced: false } } },
  { id: 59, name: "475-随便", zhanli: 0.5, heroList: [33, 4, 35, 7], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 60, name: "363-夭天", zhanli: 0.37, heroList: [22, 2, 37, 30], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 61, name: "385-WO笑笑", zhanli: 0.91, heroList: [5, 4, 7, 41], rounds: { "128": { results: [3, 3, 2, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 2, 3], advanced: true }, "32": { results: [2, 2, 1, 2, 1, 2, 2], advanced: false } } },
  { id: 62, name: "265-凤凰涅槃", zhanli: 0.87, heroList: [7, 21, 19, 7], rounds: { "128": { results: [4, 4, 1, 4, 4], advanced: false } } },
  { id: 63, name: "340-暗影", zhanli: 0.63, heroList: [2, 22, 30, 37], rounds: { "128": { results: [2, 2, 1, 1, 1, 2, 1], advanced: true }, "64": { results: [4, 4, 4, 1, 4], advanced: false } } },
  { id: 64, name: "14-何木期", zhanli: 0.48, heroList: [2, 22, 30, 6], rounds: { "128": { results: [1, 1, 2, 2, 2, 1, 2], advanced: false } } },
  { id: 65, name: "393-一轮明月", zhanli: 1.51, heroList: [3, 4, 17, 34], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [3, 3, 3, 2, 3, 3], advanced: true }, "16": { results: [1, 1, 3, 3, 2, 1], advanced: true }, "8": { results: [1, 1, 1, 1, 1], advanced: true }, "4": { results: [2, 1, 1, 1, 1, 2, 1], advanced: true }, final: { results: [2, 2, 1, 1, 2, 1, 1, 1], advanced: true } } },
  { id: 66, name: "497-以父之名", zhanli: 0.28, heroList: [4, 5, 10, 38], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 67, name: "193-RenQun", zhanli: 0.64, heroList: [11, 16, 17, 3], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 68, name: "449-老猫", zhanli: 0.36, heroList: [30, 40, 22, 6], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 69, name: "467-寂风", zhanli: 0.59, heroList: [4, 5, 41, 38], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 70, name: "235-腮飚飧", zhanli: 0.47, heroList: [17, 34, 3, 40], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 71, name: "221-阿玛尼", zhanli: 0.72, heroList: [7, 17, 4, 16], rounds: { "128": { results: [3, 2, 4, 2, 3, 2], advanced: false } } },
  { id: 72, name: "201-断罪之燚", zhanli: 0.64, heroList: [39, 22, 2, 30], rounds: { "128": { results: [4, 1, 3, 1, 4, 1], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [4, 4, 4, 1, 4, 4], advanced: false } } },
  { id: 73, name: "320-马甲", zhanli: 0.74, heroList: [37, 30, 2, 22], rounds: { "128": { results: [2, 4, 1, 1, 1, 4, 2], advanced: false } } },
  { id: 74, name: "395-变秃方能变强", zhanli: 0.63, heroList: [5, 41, 17, 4], rounds: { "128": { results: [1, 3, 2, 2, 2, 3, 1], advanced: true }, "64": { results: [4, 4, 4, 2], advanced: false } } },
  { id: 75, name: "157-#", zhanli: 0.72, heroList: [5, 41, 1, 13], rounds: { "128": { results: [3, 2, 3, 2, 3, 2, 3], advanced: true }, "64": { results: [3, 3, 3, 1], advanced: true }, "32": { results: [4, 4, 4, 4, 4], advanced: false } } },
  { id: 76, name: "18-達.", zhanli: 0.69, heroList: [37, 13, 6, 5], rounds: { "128": { results: [4, 1, 4, 1, 4, 1, 4], advanced: false } } },
  { id: 77, name: "337-入眼", zhanli: 0.75, heroList: [38, 29, 41, 4], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 1, 2, 1, 2, 1], advanced: true }, "32": { results: [3, 3, 3, 3, 3], advanced: true }, "16": { results: [2, 2, 4, 4, 1, 2], advanced: false } } },
  { id: 78, name: "177-烟头烫外星人", zhanli: 0.74, heroList: [11, 5, 41, 28], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 79, name: "148-大核桃", zhanli: 0.94, heroList: [37, 32, 3, 22], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 2, 1, 2, 1, 2], advanced: false } } },
  { id: 80, name: "458-换个发牌员吧", zhanli: 0.68, heroList: [7, 16, 3, 40], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 81, name: "262-陈炜鹏", zhanli: 1.01, heroList: [3, 34, 36, 29], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 2, 3, 3, 3], advanced: true }, "32": { results: [1, 1, 2, 2, 1, 2, 1, 2, 1], advanced: true }, "16": { results: [1, 2, 3, 2, 1, 1, 3], advanced: true }, "8": { results: [2, 2, 2, 2, 2], advanced: false } } },
  { id: 82, name: "322-清墨", zhanli: 0.55, heroList: [2, 30, 22, 37], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 83, name: "385-巴斯光年", zhanli: 0.43, heroList: [5, 15, 41, 4], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 1, 4, 4, 4], advanced: false } } },
  { id: 84, name: "27-罗昊", zhanli: 0.98, heroList: [34, 30, 40, 22], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 85, name: "208-杀破猪", zhanli: 1.1, heroList: [30, 2, 22, 37], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 1, 1, 2, 1, 1], advanced: true }, "32": { results: [2, 2, 1, 1, 2, 1, 2, 1, 2], advanced: false } } },
  { id: 86, name: "124-蒋帆", zhanli: 0.61, heroList: [5, 1, 6, 13], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 87, name: "166-姜岩", zhanli: 0.91, heroList: [36, 9, 2, 10], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 2, 2, 1, 2, 2], advanced: false } } },
  { id: 88, name: "211-x", zhanli: 0.45, heroList: [2, 22, 37, 39], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 89, name: "99-河中山", zhanli: 1.08, heroList: [3, 34, 27, 40], rounds: { "128": { results: [1, 3, 3, 3], advanced: true }, "64": { results: [1, 1, 2, 3, 1], advanced: true }, "32": { results: [2, 1, 1, 2, 1, 2, 1, 2, 1], advanced: true }, "16": { results: [2, 1, 4, 1, 2, 2, 4], advanced: false } } },
  { id: 90, name: "76-路易达", zhanli: 0.58, heroList: [3, 34, 22, 2], rounds: { "128": { results: [2, 4, 4, 4], advanced: false } } },
  { id: 91, name: "354-柴腾凯", zhanli: 0.89, heroList: [5, 11, 41, 1], rounds: { "128": { results: [1, 2, 1, 2, 2, 2], advanced: false } } },
  { id: 92, name: "399-谢谢你", zhanli: 0.68, heroList: [34, 9, 36, 29], rounds: { "128": { results: [2, 1, 2, 1, 1, 1], advanced: true }, "64": { results: [2, 2, 1, 4, 2], advanced: false } } },
  { id: 93, name: "194-On鸩", zhanli: 0.65, heroList: [11, 38, 29, 8], rounds: { "128": { results: [4, 2, 1, 2, 4], advanced: false } } },
  { id: 94, name: "298-守誓", zhanli: 0.7, heroList: [6, 13, 22, 39], rounds: { "128": { results: [3, 1, 2, 1, 3], advanced: true }, "64": { results: [2, 1, 2, 4, 1, 1, 2], advanced: false } } },
  { id: 95, name: "200-镇魂CSI", zhanli: 1.19, heroList: [3, 7, 4, 29], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 2, 1, 3, 2, 2, 1], advanced: true }, "32": { results: [1, 2, 2, 1, 2, 1, 2, 1, 2], advanced: false } } },
  { id: 96, name: "314-落幕", zhanli: 0.4, heroList: [9, 34, 36, 19], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 97, name: "234-律师", zhanli: 2.07, heroList: [5, 41, 4, 11], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [3, 3, 3, 3, 3], advanced: true }, "16": { results: [3, 3, 3, 3, 3], advanced: true }, "8": { results: [1, 1, 2, 1, 1, 1], advanced: true }, "4": { results: [1, 2, 2, 2, 2, 1, 2], advanced: false }, third: { results: [1, 2, 1, 1, 1, 1], advanced: true } } },
  { id: 98, name: "283-达尼兹", zhanli: 0.45, heroList: [5, 41, 13, 1], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 99, name: "453-生", zhanli: 0.45, heroList: [4, 35, 38, 41], rounds: { "128": { results: [2, 2, 1, 4, 1, 2], advanced: false } } },
  { id: 100, name: "489-总被女人骗", zhanli: 0.5, heroList: [5, 41, 1, 13], rounds: { "128": { results: [1, 1, 2, 3, 2, 1], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 101, name: "75-Luo", zhanli: 0.85, heroList: [30, 13, 6, 22], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 3, 3, 3], advanced: true }, "32": { results: [4, 4, 4, 4, 4], advanced: false } } },
  { id: 102, name: "401-单", zhanli: 0.29, heroList: [22, 2, 30, 39], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 103, name: "439-湗潇", zhanli: 0.5, heroList: [5, 11, 4, 41], rounds: { "128": { results: [3, 4, 1, 1, 3], advanced: true }, "64": { results: [2, 4, 4, 4], advanced: false } } },
  { id: 104, name: "361-LSJ", zhanli: 0.55, heroList: [10, 2, 22, 9], rounds: { "128": { results: [4, 3, 2, 2, 4], advanced: false } } },
  { id: 105, name: "149-灰企鹅", zhanli: 0.95, heroList: [38, 5, 41, 11], rounds: { "128": { results: [2, 3, 1, 2, 2, 3, 1], advanced: true }, "64": { results: [2, 3, 1, 1, 2, 3], advanced: true }, "32": { results: [4, 4, 4, 4, 4], advanced: false } } },
  { id: 106, name: "194-Dang", zhanli: 0.6, heroList: [6, 15, 13, 22], rounds: { "128": { results: [1, 4, 2, 1, 1, 4, 2], advanced: false } } },
  { id: 107, name: "75-倪", zhanli: 0.69, heroList: [3, 40, 34, 36], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 4, 2, 2, 1, 4], advanced: false } } },
  { id: 108, name: "330-小凯", zhanli: 0.92, heroList: [3, 40, 29, 34], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 109, name: "159-Jason", zhanli: 0.9, heroList: [5, 41, 4, 1], rounds: { "128": { results: [1, 3, 3, 1], advanced: true }, "64": { results: [1, 1, 1, 1], advanced: true }, "32": { results: [3, 3, 3, 3, 3], advanced: true }, "16": { results: [4, 4, 4, 4, 4], advanced: false } } },
  { id: 110, name: "77-啾啾", zhanli: 0.69, heroList: [4, 33, 7, 35], rounds: { "128": { results: [2, 4, 4, 2], advanced: false } } },
  { id: 111, name: "12-叶某人", zhanli: 0.81, heroList: [4, 35, 38, 33], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [2, 2, 2, 2], advanced: false } } },
  { id: 112, name: "319-十九", zhanli: 0.58, heroList: [11, 5, 4, 41], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 113, name: "481-王某某", zhanli: 0.51, heroList: [11, 5, 41, 4], rounds: { "128": { results: [4, 1, 1, 2, 4, 1, 1], advanced: true }, "64": { results: [4, 1, 1, 1, 4, 2, 2], advanced: false } } },
  { id: 114, name: "166-mr", zhanli: 0.68, heroList: [6, 13, 22, 37], rounds: { "128": { results: [3, 2, 2, 1, 3, 2, 2], advanced: false } } },
  { id: 115, name: "200-黑曜", zhanli: 0.71, heroList: [2, 22, 37, 6], rounds: { "128": { results: [1, 3, 2, 1, 2, 3], advanced: true }, "64": { results: [3, 2, 2, 2, 3, 1, 1], advanced: true }, "32": { results: [2, 2, 4, 2, 1, 1, 4], advanced: false } } },
  { id: 116, name: "340-三四", zhanli: 0.59, heroList: [13, 1, 5, 41], rounds: { "128": { results: [2, 4, 1, 2, 1, 4], advanced: false } } },
  { id: 117, name: "281-太阳出来爬", zhanli: 1.05, heroList: [41, 3, 5, 1], rounds: { "128": { results: [3, 1, 1, 1], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [1, 1, 3, 1, 2, 2, 3], advanced: true }, "16": { results: [2, 2, 1, 4, 2, 2], advanced: false } } },
  { id: 118, name: "121-狗俊", zhanli: 0.99, heroList: [13, 3, 34, 6], rounds: { "128": { results: [4, 2, 2, 2], advanced: false } } },
  { id: 119, name: "318-19舔马腚", zhanli: 0.9, heroList: [6, 5, 13, 4], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 120, name: "303-徐yang", zhanli: 0.61, heroList: [3, 34, 40, 25], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 121, name: "468-9527", zhanli: 1, heroList: [4, 38, 5, 41], rounds: { "128": { results: [3, 2, 1, 2, 3, 2, 1], advanced: true }, "64": { results: [2, 1, 1, 2, 2, 2], advanced: false } } },
  { id: 122, name: "177-SHEN", zhanli: 0.62, heroList: [39, 22, 2, 30], rounds: { "128": { results: [4, 1, 2, 1, 4, 1, 2], advanced: false } } },
  { id: 123, name: "369-一见如顾", zhanli: 0.47, heroList: [3, 25, 34, 36], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 124, name: "43-不如氪金", zhanli: 1.03, heroList: [4, 7, 23, 5], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [1, 2, 2, 1, 1, 1], advanced: true }, "32": { results: [2, 2, 1, 2, 1, 2, 1, 2], advanced: false } } },
  { id: 125, name: "144-zwy", zhanli: 1.6, heroList: [4, 7, 41, 5], rounds: { "128": { results: [3, 3, 3, 3], advanced: true }, "64": { results: [3, 3, 3, 3], advanced: true }, "32": { results: [1, 1, 2, 1, 2, 1, 2, 1], advanced: true }, "16": { results: [1, 1, 2, 3, 1, 1], advanced: true }, "8": { results: [2, 2, 1, 2, 2, 2], advanced: false } } },
  { id: 126, name: "100-缄默", zhanli: 0.52, heroList: [9, 36, 34, 29], rounds: { "128": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 127, name: "395-豹米花", zhanli: 0.75, heroList: [5, 11, 41, 4], rounds: { "128": { results: [3, 3, 2, 1, 3], advanced: true }, "64": { results: [4, 4, 4, 4], advanced: false } } },
  { id: 128, name: "193-Du", zhanli: 0.77, heroList: [3, 16, 11, 17], rounds: { "128": { results: [4, 4, 1, 2, 4], advanced: false } } },
];

export function getRosterPlayer(id: number): RosterPlayer | undefined {
  return roster.find((p) => p.id === id);
}

export function getRoundRecord(p: RosterPlayer | undefined, round: BracketRound): RoundRecord | undefined {
  return p?.rounds[round];
}

export function getRoundResults(p: RosterPlayer | undefined, round: BracketRound = "128"): number[] {
  return p?.rounds[round]?.results ?? [];
}

export function hasAdvanced(p: RosterPlayer | undefined, from: BracketRound = "128"): boolean {
  return p?.rounds[from]?.advanced === true;
}

/** 本轮打完且未晋级（冠军除外） */
export function isEliminated(p: RosterPlayer | undefined): boolean {
  if (!p) return false;
  if (p.rounds.final?.advanced) return false;
  for (let i = BRACKET_ROUNDS.length - 1; i >= 0; i--) {
    const rec = p.rounds[BRACKET_ROUNDS[i]];
    if (rec) return rec.advanced === false;
  }
  return false;
}

/** 是否进入该轮（128 全员；其后看上一轮是否晋级） */
export function reachedRound(p: RosterPlayer | undefined, round: BracketRound): boolean {
  if (!p) return false;
  if (round === "128") return true;
  if (round === "third") return p.rounds["4"]?.advanced === false;
  const i = BRACKET_ROUNDS.indexOf(round as (typeof BRACKET_ROUNDS)[number]);
  if (i < 0) return false;
  const prev = BRACKET_ROUNDS[i - 1];
  return p.rounds[prev]?.advanced === true;
}

/** 该轮对阵区间：128 两人一组，64 四人一组晋级两人互打，以此类推 */
export const ROUND_BRACKET_SIZE: Record<BracketRound, number> = {
  "128": 2,
  "64": 4,
  "32": 8,
  "16": 16,
  "8": 32,
  "4": 64,
  third: 128,
  final: 128
};

export function getRoundOpponent(playerId: number, round: BracketRound): RosterPlayer | undefined {
  const size = ROUND_BRACKET_SIZE[round];
  const start = Math.floor((playerId - 1) / size) * size + 1;
  const end = start + size - 1;
  return roster.find((p) => p.id >= start && p.id <= end && p.id !== playerId && reachedRound(p, round));
}

export function getPlayedRounds(p: RosterPlayer | undefined): BracketRound[] {
  if (!p) return [];
  const order: BracketRound[] = ["128", "64", "32", "16", "8", "4", "third", "final"];
  return order.filter((k) => (p.rounds[k]?.results.length ?? 0) > 0);
}

/** 当前名次标签：打到哪一轮、是否从该轮晋级 */
export function getStandingLabel(p: RosterPlayer | undefined): string {
  if (!p) return "128强";
  if (p.rounds.final?.advanced) return "冠军";
  if (p.rounds.final) return "亚军";
  if (p.rounds.third?.advanced) return "季军";
  if (p.rounds.third) return "殿军";
  if (hasAdvanced(p, "4")) return "决赛";
  if (p.rounds["4"] || hasAdvanced(p, "8")) return "半决赛";
  if (p.rounds["8"] || hasAdvanced(p, "16")) return "8强";
  if (p.rounds["16"] || hasAdvanced(p, "32")) return "16强";
  if (p.rounds["32"] || hasAdvanced(p, "64")) return "32强";
  if (p.rounds["64"] || hasAdvanced(p, "128")) return "64强";
  return "128强";
}
