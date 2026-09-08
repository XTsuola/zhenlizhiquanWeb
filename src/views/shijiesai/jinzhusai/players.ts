/** 金主赛选手：签位 1–128，可直接改 name / zhanli（保留两位小数） */
export type JinzhusaiPlayer = {
  id: number;
  name: string;
  /** 战力，保留两位小数 */
  zhanli: number;
};

export const players: JinzhusaiPlayer[] = [
  { id: 1, name: "170-阿源", zhanli: 1.61 },
  { id: 2, name: "393-五五开仙人", zhanli: 0.43 },
  { id: 3, name: "467-小助手", zhanli: 0.58 },
  { id: 4, name: "214-朔", zhanli: 0.42 },
  { id: 5, name: "50-Mr", zhanli: 1.05 },
  { id: 6, name: "349-游乐园", zhanli: 0.62 },
  { id: 7, name: "43-闹笑话的绅士", zhanli: 1.18 },
  { id: 8, name: "310-鱼儿", zhanli: 0.47 },
  { id: 9, name: "49-ZCY", zhanli: 1.26 },
  { id: 10, name: "203-开摆", zhanli: 0.52 },
  { id: 11, name: "417-建峰", zhanli: 0.62 },
  { id: 12, name: "31-冰翼", zhanli: 0.66 },
  { id: 13, name: "117-不过须臾", zhanli: 1.10 },
  { id: 14, name: "146-KB", zhanli: 1.17 },
  { id: 15, name: "354-洎信", zhanli: 0.78 },
  { id: 16, name: "21-无名", zhanli: 1.14 },
  { id: 17, name: "69-伴宫星自", zhanli: 1.96 },
  { id: 18, name: "436-苏幕", zhanli: 0.48 },
  { id: 19, name: "296-听故事的人", zhanli: 0.64 },
  { id: 20, name: "311-大黑鱼", zhanli: 0.68 },
  { id: 21, name: "354-无语没话说", zhanli: 0.95 },
  { id: 22, name: "481-有事語音", zhanli: 0.58 },
  { id: 23, name: "22-塔罗会愚者", zhanli: 1.02 },
  { id: 24, name: "350-随風", zhanli: 0.32 },
  { id: 25, name: "206-电量不足", zhanli: 1.24 },
  { id: 26, name: "505-何文", zhanli: 0.39 },
  { id: 27, name: "119-逆天", zhanli: 0.96 },
  { id: 28, name: "166-顾圆", zhanli: 0.66 },
  { id: 29, name: "27-热血战歌", zhanli: 1.34 },
  { id: 30, name: "191-理解力", zhanli: 0.82 },
  { id: 31, name: "129-旧城之下", zhanli: 1.46 },
  { id: 32, name: "40-黄海雍", zhanli: 0.69 },
  { id: 33, name: "354-sky", zhanli: 0.76 },
  { id: 34, name: "449-肥太狼", zhanli: 0.35 },
  { id: 35, name: "277-橘子来了", zhanli: 0.43 },
  { id: 36, name: "443-开", zhanli: 0.26 },
  { id: 37, name: "292-舒适圈", zhanli: 0.95 },
  { id: 38, name: "489-Toki", zhanli: 0.25 },
  { id: 39, name: "101-tristy", zhanli: 0.85 },
  { id: 40, name: "91-李果", zhanli: 1.27 },
  { id: 41, name: "337-入眼", zhanli: 1.00 },
  { id: 42, name: "46-漠溪", zhanli: 0.60 },
  { id: 43, name: "26-狗宁", zhanli: 2.16 },
  { id: 44, name: "190-神秘人物", zhanli: 0.86 },
  { id: 45, name: "397-独眼King", zhanli: 1.06 },
  { id: 46, name: "118-風尘依旧", zhanli: 0.90 },
  { id: 47, name: "69-卓一塑业", zhanli: 1.49 },
  { id: 48, name: "157-段", zhanli: 1.22 },
  { id: 49, name: "41-异界淘金者", zhanli: 1.34 },
  { id: 50, name: "385-从前", zhanli: 0.27 },
  { id: 51, name: "281-惊蛰", zhanli: 0.65 },
  { id: 52, name: "385-搓搓", zhanli: 0.22 },
  { id: 53, name: "481-星辰", zhanli: 0.64 },
  { id: 54, name: "213-玄", zhanli: 0.37 },
  { id: 55, name: "505-无情", zhanli: 0.33 },
  { id: 56, name: "354-桐芯", zhanli: 0.38 },
  { id: 57, name: "398-一只奶黄包", zhanli: 1.35 },
  { id: 58, name: "119-铁蛋", zhanli: 0.71 },
  { id: 59, name: "475-随便", zhanli: 0.50 },
  { id: 60, name: "363-夭天", zhanli: 0.37 },
  { id: 61, name: "385-WO笑笑", zhanli: 0.91 },
  { id: 62, name: "265-凤凰涅槃", zhanli: 0.87 },
  { id: 63, name: "340-暗影", zhanli: 0.63 },
  { id: 64, name: "14-何木期", zhanli: 0.48 },
  { id: 65, name: "393-一轮明月", zhanli: 1.51 },
  { id: 66, name: "497-以父之名", zhanli: 0.28 },
  { id: 67, name: "193-RenQun", zhanli: 0.64 },
  { id: 68, name: "449-老猫", zhanli: 0.36 },
  { id: 69, name: "467-寂风", zhanli: 0.59 },
  { id: 70, name: "235-腮飚飧", zhanli: 0.47 },
  { id: 71, name: "221-阿玛尼", zhanli: 0.72 },
  { id: 72, name: "201-断罪之燚", zhanli: 0.64 },
  { id: 73, name: "320-马甲", zhanli: 0.74 },
  { id: 74, name: "395-变秃方能变强", zhanli: 0.63 },
  { id: 75, name: "157-#", zhanli: 0.72 },
  { id: 76, name: "18-達.", zhanli: 0.69 },
  { id: 77, name: "337-入眼", zhanli: 0.75 },
  { id: 78, name: "177-烟头烫外星人", zhanli: 0.74 },
  { id: 79, name: "148-大核桃", zhanli: 0.94 },
  { id: 80, name: "458-换个发牌员吧", zhanli: 0.68 },
  { id: 81, name: "262-陈炜鹏", zhanli: 1.01 },
  { id: 82, name: "322-清墨", zhanli: 0.55 },
  { id: 83, name: "385-巴斯光年", zhanli: 0.43 },
  { id: 84, name: "27-罗昊", zhanli: 0.98 },
  { id: 85, name: "208-杀破猪", zhanli: 1.10 },
  { id: 86, name: "124-蒋帆", zhanli: 0.61 },
  { id: 87, name: "166-姜岩", zhanli: 0.91 },
  { id: 88, name: "211-x", zhanli: 0.45 },
  { id: 89, name: "99-河中山", zhanli: 1.08 },
  { id: 90, name: "76-路易达", zhanli: 0.58 },
  { id: 91, name: "354-柴腾凯", zhanli: 0.89 },
  { id: 92, name: "399-谢谢你", zhanli: 0.68 },
  { id: 93, name: "194-On鸩", zhanli: 0.65 },
  { id: 94, name: "298-守誓", zhanli: 0.70 },
  { id: 95, name: "200-镇魂CSI", zhanli: 1.19 },
  { id: 96, name: "314-落幕", zhanli: 0.40 },
  { id: 97, name: "234-律师", zhanli: 2.07 },
  { id: 98, name: "283-达尼兹", zhanli: 0.45 },
  { id: 99, name: "453-生", zhanli: 0.45 },
  { id: 100, name: "489-总被女人骗", zhanli: 0.50 },
  { id: 101, name: "75-Luo", zhanli: 0.85 },
  { id: 102, name: "401-单", zhanli: 0.29 },
  { id: 103, name: "439-湗潇", zhanli: 0.50 },
  { id: 104, name: "361-LSJ", zhanli: 0.55 },
  { id: 105, name: "149-灰企鹅", zhanli: 0.95 },
  { id: 106, name: "194-Dang", zhanli: 0.60 },
  { id: 107, name: "75-倪", zhanli: 0.69 },
  { id: 108, name: "330-小凯", zhanli: 0.92 },
  { id: 109, name: "159-Jason", zhanli: 0.90 },
  { id: 110, name: "77-啾啾", zhanli: 0.69 },
  { id: 111, name: "12-叶某人", zhanli: 0.81 },
  { id: 112, name: "319-十九", zhanli: 0.58 },
  { id: 113, name: "481-王某某", zhanli: 0.51 },
  { id: 114, name: "166-mr", zhanli: 0.68 },
  { id: 115, name: "200-黑曜", zhanli: 0.71 },
  { id: 116, name: "340-三四", zhanli: 0.59 },
  { id: 117, name: "281-太阳出来爬", zhanli: 1.05 },
  { id: 118, name: "121-狗俊", zhanli: 0.99 },
  { id: 119, name: "318-19舔马腚", zhanli: 0.90 },
  { id: 120, name: "303-徐yang", zhanli: 0.61 },
  { id: 121, name: "468-9527", zhanli: 1.00 },
  { id: 122, name: "177-SHEN", zhanli: 0.62 },
  { id: 123, name: "369-一见如顾", zhanli: 0.47 },
  { id: 124, name: "43-不如氪金", zhanli: 1.03 },
  { id: 125, name: "144-zwy", zhanli: 1.60 },
  { id: 126, name: "100-缄默", zhanli: 0.52 },
  { id: 127, name: "395-豹米花", zhanli: 0.75 },
  { id: 128, name: "193-Du", zhanli: 0.77 }
];

export function getPlayerName(id: number): string {
  return players[id - 1]?.name || `${id}号选手`;
}

export function getPlayerZhanli(id: number): number {
  const v = players[id - 1]?.zhanli;
  return Number.isFinite(v) ? Number(Number(v).toFixed(2)) : 0;
}

export type PlayerSlotInfo = {
  name: string;
  zhanli: number;
};

export function getPlayerSlot(id: number): PlayerSlotInfo {
  const p = players[id - 1];
  if (!p) return { name: `${id}号选手`, zhanli: 0 };
  return { name: p.name, zhanli: Number(Number(p.zhanli).toFixed(2)) };
}
