type Option<T = string | number> = { label: string; value: T };

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function toDateParts(date: Date | string | number) {
  const d = new Date(date);
  return {
    year: d.getFullYear(),
    month: pad2(d.getMonth() + 1),
    day: pad2(d.getDate()),
    hour: pad2(d.getHours()),
    minute: pad2(d.getMinutes()),
    second: pad2(d.getSeconds())
  };
}

/** 格式化到秒：默认 `YYYY-MM-DD HH:mm:ss`，传 type 则用其作日期分隔符 */
export function formatDate(date: Date | string | number, type?: string) {
  const { year, month, day, hour, minute, second } = toDateParts(date);
  const sep = type ?? "-";
  return `${year}${sep}${month}${sep}${day} ${hour}:${minute}:${second}`;
}

/** 格式化到日：`YYYY-MM-DD` */
export function formatDate2(date: Date | string | number) {
  const { year, month, day } = toDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getNowDate() {
  return formatDate2(new Date());
}

function optionsFrom<T extends string | number>(
  items: Array<[string, T]>
): Option<T>[] {
  return items.map(([label, value]) => ({ label, value }));
}

export const zhenyinList = [
  "四芒帝国",
  "隐秘者",
  "禅意谷",
  "天堂港",
  "炼狱深渊",
  "蛮石旷野",
  "冬神使徒"
];

export const qualityList = ["白", "蓝", "紫", "橙"];

export const cardZhenyinList: Option[] = [
  { label: "全部", value: "" },
  ...zhenyinList.map((label, i) => ({ label, value: i + 1 }))
];

export const cardQualityList: Option[] = [
  { label: "全部", value: "" },
  { label: "橙", value: 4 },
  { label: "紫", value: 3 },
  { label: "蓝", value: 2 },
  { label: "白", value: 1 }
];

export const shenqiQualityList: Option[] = [
  { label: "全部", value: "" },
  { label: "橙", value: 3 },
  { label: "紫", value: 2 },
  { label: "蓝", value: 1 }
];

export const costList: Option[] = [
  { label: "全部", value: "" },
  ...Array.from({ length: 10 }, (_, i) => ({ label: `${i}费`, value: i }))
];

/** 费用从高到低 */
export const costList2: Option[] = [
  { label: "全部", value: "" },
  ...Array.from({ length: 10 }, (_, i) => {
    const v = 9 - i;
    return { label: `${v}费`, value: v };
  })
];

export const typeList: Option[] = [
  { label: "全部", value: "" },
  { label: "武器", value: 1 },
  { label: "宝物", value: 2 }
];

export const zhanquList = optionsFrom(
  Array.from({ length: 16 }, (_, i) => [
    `第${["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六"][i]}战区`,
    70100 + i * 100
  ] as [string, number])
);

export const changciList = optionsFrom([
  ["八强赛A（左上）", 1],
  ["八强赛B（左下）", 2],
  ["八强赛C（右上）", 3],
  ["八强赛D（右下）", 4],
  ["四强赛AB（左）", 5],
  ["四强赛CD（右）", 6],
  ["季军赛", 7],
  ["冠军赛", 8]
]);

export const keduList = optionsFrom([
  ["顶氪", 9],
  ["巨氪", 8],
  ["大氪", 7],
  ["中大氪", 6],
  ["中氪", 5],
  ["中低氪", 4],
  ["低氪", 3],
  ["微氪", 2],
  ["零氪", 1]
]);

export const shengfuSelect = optionsFrom([
  ["战胜", 1],
  ["战败", 2],
  ["弃权", 0],
  ["战胜（无效）", 3],
  ["战败（无效）", 4]
]);

/** 原始卡牌数据转换（本地脚本/导入用） */
export function getShenqiList(data: any[]) {
  return data.map((item) => ({
    name: item.name,
    zhenyin: 7,
    quality: qualityList.findIndex((q) => q == item.quality),
    type: item.type,
    img: item.img,
    data: item.data.map((row: any[]) => ({ effect: row[0] }))
  }));
}

export function getHeroList(data: any[]) {
  return data.map((item) => ({
    name: item.name,
    zhu: zhenyinList.findIndex((z) => z == item.zhu) + 1,
    fu: zhenyinList.findIndex((z) => z == item.fu) + 1,
    quality: qualityList.findIndex((q) => q == item.quality) + 1,
    skillName: item.skillName,
    img: item.img,
    data: item.data.map((row: any[]) => ({ effect: row[0] }))
  }));
}

export const qingshuBase2 = {
  backgroundTitle: "(1)游戏背景：",
  background:
    "每位玩家都将扮演公主的追求者，游戏目的是成为最后一个被淘汰者，这样便可以将自己的情书送给公主，从而获得一颗公主的爱心。 当爱心达到一定数量时，你便可以迎娶公主，走向人生巅峰。",
  roleTitle: "(2)游戏角色：",
  roleIntroduce: [
    "1.（侍卫）：共5张。指定一名玩家猜出其一张名字不是侍卫的卡，如果该名玩家持有这张卡，则他淘汰出局。",
    "2.（牧师）：共2张。查看另一名玩家的手牌。",
    "3.（男爵）：共2张。选择另一名玩家，与其比较手牌点数大小，较小者淘汰出局。",
    "4.（侍女）：共2张。直到你的下一个回合，忽略其他玩家的卡牌对你的影响。",
    "5.（王子）：共2张。选择场上一名还在游戏中的玩家，被指定的玩家弃掉手牌，然后摸一张新的牌。",
    "6.（国王）：共1张。将你手上的卡与你选择的另一名玩家交换。",
    "7.（女伯爵）：共1张。如果你手上有女伯爵并且有着国王或者王子的时候，你必须弃置女伯爵。",
    "8.（公主）：共1张。如果你弃置或者打出这张牌，你将直接淘汰出局。"
  ],
  role: [
    { id: 1, name: "侍卫" },
    { id: 2, name: "牧师" },
    { id: 3, name: "男爵" },
    { id: 4, name: "侍女" },
    { id: 5, name: "王子" },
    { id: 6, name: "国王" },
    { id: 7, name: "女伯爵" },
    { id: 8, name: "公主" }
  ]
};

export const qingshuBase = {
  backgroundTitle: "(1)游戏背景：",
  background:
    "每位玩家都将借助英灵的力量，最终见到永夜女王，如果你弃掉辉夜女王视为失败。",
  roleTitle: "(2)游戏角色：",
  roleIntroduce: [
    "1.（圣堂门卫）：共5张。指定一名玩家猜出其一张名字不是门卫的卡，如果该名玩家持有这张卡，则他淘汰出局。",
    "2.（洞悉之眼）：共2张。查看另一名玩家的手牌。",
    "3.（决斗）：共2张。选择另一名决斗玩家，与其比较手牌点数大小，较小者淘汰出局。",
    "4.（露娜）：共2张。直到你的下一个回合，忽略其他玩家的卡牌对你的影响。",
    "5.（莉莉丝）：共2张。选择场上一名还在游戏中的玩家，被指定的玩家弃掉手牌，然后摸一张新的牌。",
    "6.（大主教）：共1张。将你手上的卡与你选择的另一名玩家交换。",
    "7.（时光米拉）：共1张。如果你手上有时光米拉并且有着大主教或者莉莉丝的时候，你必须弃置时光米拉。",
    "8.（永夜女王）：共1张。如果你弃置或者打出这张牌，你将直接淘汰出局。"
  ],
  role: [
    { id: 1, name: "圣堂门卫" },
    { id: 2, name: "洞悉之眼" },
    { id: 3, name: "决斗" },
    { id: 4, name: "露娜" },
    { id: 5, name: "莉莉丝" },
    { id: 6, name: "大主教" },
    { id: 7, name: "时光米拉" },
    { id: 8, name: "永夜女王" }
  ]
};

export function calculateCarsRatio(grade: { grade: string }[]) {
  const counts = [0, 0, 0, 0, 0, 0, 0]; // d..ss mapped by grade 0..6
  for (const e of grade) {
    const g = JSON.parse(e.grade)[0] as number;
    if (g >= 0 && g <= 6) counts[g]++;
  }
  const pct = (v: number) => `${(v / 6.35).toFixed(2)}%`;
  return {
    d: pct(counts[0]),
    c: pct(counts[1]),
    b: pct(counts[2]),
    a: pct(counts[3]),
    aa: pct(counts[4]),
    s: pct(counts[5]),
    ss: pct(counts[6])
  };
}

export const tabList1 = ["护甲", "回血", "洞察", "传承", "践踏", "先攻", "禁疗", "磐龙", "协战", "穿透", "冰封", "迟缓", "守军", "神佑", "魔免", "魂歌", "隐形", "连击", "亡语", "沉默", "魔防", "跳费", "压费", "召唤"
];

/** 筛选标签（value 从 1 起） */
export const tabList: Option<number>[] = ["护甲", "回血", "洞察", "传承", "践踏", "先攻", "禁疗", "磐龙", "协战", "穿透", "冰封", "迟缓", "守军", "神佑", "魔免", "魂歌", "隐形", "连击", "亡语", "沉默", "魔防", "压费", "跳费", "召唤", "过牌", "机制"].map((label, i) => ({ label, value: i + 1 }));

/** arr1 中的每个值是否都存在于 arr2 */
export function allValuesInArray<T>(arr1: T[], arr2: T[]) {
  return arr1.every((value) => arr2.includes(value));
}

export const skinSelect = [
  {
    "cardId": 82,
    "name": "曙光·安娜贝尔",
    "zhenyin": 1,
    "cost": 3,
    "img": "/huaguangchunying_annabeier",
    "pici": 2,
  },
  {
    "cardId": 83,
    "name": "圣枪·卡洛琳",
    "zhenyin": 1,
    "cost": 4,
    "img": "/baihuachangqiang_kaluolin",
    "pici": 1,
  },
  {
    "cardId": 84,
    "name": "明日之音·露娜",
    "zhenyin": 1,
    "cost": 4,
    "img": "/mingrixiang_luna",
    "pici": 7,
  },
  {
    "cardId": 85,
    "name": "帝国军魂·莱哈特",
    "zhenyin": 1,
    "cost": 5,
    "img": "/yonghengzhiwang_laihate",
    "pici": 5,
  },
  {
    "cardId": 86,
    "name": "正阳大主教·伊恩",
    "zhenyin": 1,
    "cost": 6,
    "img": "/baipao_yien",
    "pici": 4,
  },
  {
    "cardId": 87,
    "name": "司莫斯阵地",
    "zhenyin": 1,
    "cost": 6,
    "img": "/simosideguanghuizhendi",
    "pici": 9,
  },
  {
    "cardId": 88,
    "name": "炫目天使·蕾娜",
    "zhenyin": 1,
    "cost": 7,
    "img": "/shenpantianshi_leina",
    "pici": 3,
  },
  {
    "cardId": 89,
    "name": "钢铁统帅·雷蒙德",
    "zhenyin": 1,
    "cost": 8,
    "img": "/wusheng_yunchang",
    "pici": 6,
  },
  {
    "cardId": 90,
    "name": "司莫斯的光明要塞",
    "zhenyin": 1,
    "cost": 9,
    "img": "/simosideyidongchengbao",
    "pici": 8,
  },
  {
    "cardId": 174,
    "name": "No.8雷鸣·泰拉德",
    "zhenyin": 2,
    "cost": 1,
    "img": "/shengseng_fahai",
    "pici": 5,
  },
  {
    "cardId": 175,
    "name": "No.4希尔伯特",
    "zhenyin": 2,
    "cost": 2,
    "img": "/zhangyuboshi_xierbote",
    "pici": 8,
  },
  {
    "cardId": 176,
    "name": "分裂实验-流浆",
    "zhenyin": 2,
    "cost": 2,
    "img": "/yinghuashiyan_liujiang",
    "pici": 9,
  },
  {
    "cardId": 177,
    "name": "No.5咒刃·布雷克",
    "zhenyin": 2,
    "cost": 3,
    "img": "/guiren_buleike",
    "pici": 2,
  },
  {
    "cardId": 178,
    "name": "鬼童-7号",
    "zhenyin": 2,
    "cost": 4,
    "img": "/liuxing_7hao",
    "pici": 4,
  },
  {
    "cardId": 179,
    "name": "No.2时光·米拉",
    "zhenyin": 2,
    "cost": 5,
    "img": "/yuezhishen_mila",
    "pici": 1,
  },
  {
    "cardId": 180,
    "name": "No.9迪宁",
    "zhenyin": 2,
    "cost": 6,
    "img": "/huabanshaonian_dining",
    "pici": 7,
  },
  {
    "cardId": 181,
    "name": "No.6沃凡瑞拉",
    "zhenyin": 2,
    "cost": 7,
    "img": "/huoshewunv_wofanruila",
    "pici": 6,
  },
  {
    "cardId": 182,
    "name": "No.3伊斯多维尔",
    "zhenyin": 2,
    "cost": 9,
    "img": "/yinmigongjue_yisiduoweier",
    "pici": 3,
  },
  {
    "cardId": 269,
    "name": "流岚刃·琳",
    "zhenyin": 3,
    "cost": 3,
    "img": "/huofenghuang_lin",
    "pici": 7,
  },
  {
    "cardId": 270,
    "name": "灵龟神丹",
    "zhenyin": 3,
    "cost": 3,
    "img": "/lingguishendan_gen",
    "pici": 9,
  },
  {
    "cardId": 271,
    "name": "神机玄女·轩",
    "zhenyin": 3,
    "cost": 4,
    "img": "/jiutianxuannv_xuan",
    "pici": 3,
  },
  {
    "cardId": 272,
    "name": "悟能禅杖",
    "zhenyin": 3,
    "cost": 4,
    "img": "/tianpengshenchui",
    "pici": 7,
  },
  {
    "cardId": 273,
    "name": "雪域春光·凛",
    "zhenyin": 3,
    "cost": 4,
    "img": "/douzi_lin",
    "pici": 6,
  },
  {
    "cardId": 274,
    "name": "三熊阵",
    "zhenyin": 3,
    "cost": 4,
    "img": "/zanmensanxiong",
    "pici": 8,
  },
  {
    "cardId": 275,
    "name": "逍遥居士·铭/神龙传人",
    "zhenyin": 3,
    "cost": 5,
    "img": "/taxuexing_ming",
    "pici": 5,
  },
  {
    "cardId": 276,
    "name": "长生不老树",
    "zhenyin": 3,
    "cost": 5,
    "img": "/xuyuanshenshu",
    "pici": 4,
  },
  {
    "cardId": 278,
    "name": "豪情禅师·悟能",
    "zhenyin": 3,
    "cost": 6,
    "img": "/tianpengyuanshuai_wuneng",
    "pici": 2,
  },
  {
    "cardId": 279,
    "name": "逸云剑·任大师",
    "zhenyin": 3,
    "cost": 7,
    "img": "/yuxuzhenjun_rendashi",
    "pici": 1,
  },
  {
    "cardId": 365,
    "name": "花剑绅士·翔",
    "zhenyin": 4,
    "cost": 2,
    "img": "/mengmianxiake_xiang",
    "pici": 6,
  },
  {
    "cardId": 364,
    "name": "蕾拉密卷",
    "zhenyin": 4,
    "cost": 2,
    "img": "/xiaohongmaomijuan",
    "pici": 7,
  },
  {
    "cardId": 366,
    "name": "海燕·鲍莉",
    "zhenyin": 4,
    "cost": 3,
    "img": "/shatanpaidui_baoli",
    "pici": 1,
  },
  {
    "cardId": 367,
    "name": "欢乐歌唱的戴维",
    "zhenyin": 4,
    "cost": 3,
    "img": "/heizhenzhudaiweichuanzhang",
    "pici": 8,
  },
  {
    "cardId": 368,
    "name": "戴维的惊天计谋",
    "zhenyin": 4,
    "cost": 3,
    "img": "/daiweidexieyuejihua",
    "pici": 9,
  },
  {
    "cardId": 369,
    "name": "魔卡幻术师·梅基",
    "zhenyin": 4,
    "cost": 4,
    "img": "/baibianmopai_meiji",
    "pici": 2,
  },
  {
    "cardId": 370,
    "name": "赤影·艾希尔",
    "zhenyin": 4,
    "cost": 4,
    "img": "/yinghua_aixier",
    "pici": 7,
  },
  {
    "cardId": 371,
    "name": "钢之咆哮·布瑞恩",
    "zhenyin": 4,
    "cost": 5,
    "img": "/tianleijianglin_buruien",
    "pici": 4,
  },
  {
    "cardId": 372,
    "name": "烈火·蕾拉",
    "zhenyin": 4,
    "cost": 5,
    "img": "/xiaohongmao_leila",
    "pici": 5,
  },
  {
    "cardId": 373,
    "name": "黑金三代目·梅森",
    "zhenyin": 4,
    "cost": 7,
    "img": "/heidaoshengtu_meisen",
    "pici": 3,
  },
  {
    "cardId": 453,
    "name": "痛苦之心",
    "zhenyin": 5,
    "cost": 2,
    "img": "/meihuozhixin",
    "pici": 7,
  },
  {
    "cardId": 454,
    "name": "血影",
    "zhenyin": 5,
    "cost": 3,
    "img": "/yanmo_xueying",
    "pici": 2,
  },
  {
    "cardId": 455,
    "name": "巴克&巴罗",
    "zhenyin": 5,
    "cost": 4,
    "img": "/shanggumanwang",
    "pici": 6,
  },
  {
    "cardId": 456,
    "name": "熔岩进击",
    "zhenyin": 5,
    "cost": 4,
    "img": "/rongyanbaofa",
    "pici": 9,
  },
  {
    "cardId": 457,
    "name": "怨魂饕餮兽",
    "zhenyin": 5,
    "cost": 5,
    "img": "/rongjintaotieshou",
    "pici": 3,
  },
  {
    "cardId": 458,
    "name": "血翼·莉莉丝",
    "zhenyin": 5,
    "cost": 6,
    "img": "/meihuozhiyi_lilisi",
    "pici": 1,
  },
  {
    "cardId": 459,
    "name": "熔炉梦魇",
    "zhenyin": 5,
    "cost": 7,
    "img": "/xukongmengyan",
    "pici": 8,
  },
  {
    "cardId": 460,
    "name": "烬喉炼狱魔",
    "zhenyin": 5,
    "cost": 8,
    "img": "/baqidashe",
    "pici": 4,
  },
  {
    "cardId": 461,
    "name": "猩红领主·巴拉克",
    "zhenyin": 5,
    "cost": 9,
    "img": "/heiantaitan_balake",
    "pici": 5,
  },
  {
    "cardId": 537,
    "name": "鸵鸟王·霍利",
    "zhenyin": 6,
    "cost": 3,
    "img": "/kongquewang_huoli",
    "pici": 5,
  },
  {
    "cardId": 538,
    "name": "旷野游侠·大羽",
    "zhenyin": 6,
    "cost": 3,
    "img": "/jinglingwangzi_dayu",
    "pici": 7,
  },
  {
    "cardId": 539,
    "name": "比尔&比利",
    "zhenyin": 6,
    "cost": 4,
    "img": "/shuangtoufashi",
    "pici": 4,
  },
  {
    "cardId": 540,
    "name": "血饮烈斧·凯",
    "zhenyin": 6,
    "cost": 5,
    "img": "/rexueyaogun_kai",
    "pici": 2,
  },
  {
    "cardId": 541,
    "name": "热血战歌！",
    "zhenyin": 6,
    "cost": 5,
    "img": "/wuweizhange",
    "pici": 9,
  },
  {
    "cardId": 542,
    "name": "蛮古撼地兽",
    "zhenyin": 6,
    "cost": 6,
    "img": "/tunhaishayuwang",
    "pici": 6,
  },
  {
    "cardId": 543,
    "name": "原野大祭师·鲁玛",
    "zhenyin": 6,
    "cost": 7,
    "img": "/baixiangzhange_luma",
    "pici": 1,
  },
  {
    "cardId": 544,
    "name": "荒原暴君·血眼",
    "zhenyin": 6,
    "cost": 8,
    "img": "/axiuluo_xueyan",
    "pici": 8,
  },
  {
    "cardId": 545,
    "name": "炎阳巨龙",
    "zhenyin": 6,
    "cost": 9,
    "img": "/heiyanmolong",
    "pici": 3,
  },
  {
    "cardId": 627,
    "name": "寒风血刃",
    "zhenyin": 7,
    "cost": 3,
    "img": "/wutouqishibingren",
    "pici": 7,
  },
  {
    "cardId": 628,
    "name": "荒芜冰巫·野",
    "zhenyin": 7,
    "cost": 3,
    "img": "/shehunwuyao_ye",
    "pici": 8,
  },
  {
    "cardId": 629,
    "name": "不息之灵",
    "zhenyin": 7,
    "cost": 4,
    "img": "/buxihanling",
    "pici": 4,
  },
  {
    "cardId": 630,
    "name": "冰野荒芜计划",
    "zhenyin": 7,
    "cost": 4,
    "img": "/bingyeyinmixingdong",
    "pici": 9,
  },
  {
    "cardId": 631,
    "name": "寒风魔将·塞古斯",
    "zhenyin": 7,
    "cost": 5,
    "img": "/wutouqishi_saigusi",
    "pici": 1,
  },
  {
    "cardId": 632,
    "name": "永夜女王",
    "zhenyin": 7,
    "cost": 5,
    "img": "/huiyenvwang",
    "pici": 6,
  },
  {
    "cardId": 633,
    "name": "王座巫妖",
    "zhenyin": 7,
    "cost": 6,
    "img": "/bingxuenvhuang",
    "pici": 5,
  },
  {
    "cardId": 634,
    "name": "冬神化身",
    "zhenyin": 7,
    "cost": 7,
    "img": "/bingxuenvwang_dongshenhuashen",
    "pici": 2,
  },
  {
    "cardId": 635,
    "name": "冰山·亚特拉斯",
    "zhenyin": 7,
    "cost": 8,
    "img": "/hunshan_yatelasi",
    "pici": 3,
  },
];
