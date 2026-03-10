export function formatDate(date: any, type?: string) {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = (newDate.getMonth() + 1) > 9 ? (newDate.getMonth() + 1) : "0" + (newDate.getMonth() + 1);
  const day = newDate.getDate() > 9 ? newDate.getDate() : "0" + newDate.getDate();
  const hour = newDate.getHours() > 9 ? newDate.getHours() : "0" + newDate.getHours();
  const minute = newDate.getMinutes() > 9 ? newDate.getMinutes() : "0" + newDate.getMinutes();
  const second = newDate.getSeconds() > 9 ? newDate.getSeconds() : "0" + newDate.getSeconds();
  if (type) {
    return year + type + month + type + day + " " + hour + ":" + minute + ":" + second;
  } else {
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }
}

export function getNowDate() {
  const newDate = new Date();
  const year = newDate.getFullYear();
  const month = (newDate.getMonth() + 1) > 9 ? (newDate.getMonth() + 1) : "0" + (newDate.getMonth() + 1);
  const day = newDate.getDate() > 9 ? newDate.getDate() : "0" + newDate.getDate();
  return year + "-" + month + "-" + day
}

export const cardZhenyinList = [
  {
    label: "全部",
    value: ""
  },
  {
    label: "四芒帝国",
    value: 1
  },
  {
    label: "隐秘者",
    value: 2
  },
  {
    label: "禅意谷",
    value: 3
  },
  {
    label: "天堂港",
    value: 4
  },
  {
    label: "炼狱深渊",
    value: 5
  },
  {
    label: "蛮石旷野",
    value: 6
  },
  {
    label: "冬神使徒",
    value: 7
  }
];

export const cardQualityList = [
  {
    label: "全部",
    value: ""
  },
  {
    label: "橙",
    value: 4
  },
  {
    label: "紫",
    value: 3
  },
  {
    label: "蓝",
    value: 2
  },
  {
    label: "白",
    value: 1
  }
];

export const shenqiQualityList = [
  {
    label: "全部",
    value: ""
  },
  {
    label: "橙",
    value: 3
  },
  {
    label: "紫",
    value: 2
  },
  {
    label: "蓝",
    value: 1
  }
];

export const costList = [
  {
    label: "全部",
    value: ""
  },
  {
    label: "0费",
    value: 0
  },
  {
    label: "1费",
    value: 1
  },
  {
    label: "2费",
    value: 2
  },
  {
    label: "3费",
    value: 3
  },
  {
    label: "4费",
    value: 4
  },
  {
    label: "5费",
    value: 5
  },
  {
    label: "6费",
    value: 6
  },
  {
    label: "7费",
    value: 7
  },
  {
    label: "8费",
    value: 8
  },
  {
    label: "9费",
    value: 9
  }
];

export const costList2 = [
  {
    label: "全部",
    value: ""
  },
  {
    label: "9费",
    value: 9
  },
  {
    label: "8费",
    value: 8
  },
  {
    label: "7费",
    value: 7
  },
  {
    label: "6费",
    value: 6
  },
  {
    label: "5费",
    value: 5
  },
  {
    label: "4费",
    value: 4
  },
  {
    label: "3费",
    value: 3
  },
  {
    label: "2费",
    value: 2
  },
  {
    label: "1费",
    value: 1
  },
  {
    label: "0费",
    value: 0
  }
];

export const typeList = [
  {
    label: "全部",
    value: ""
  },
  {
    label: "武器",
    value: 1
  },
  {
    label: "宝物",
    value: 2
  }
];

export const zhanquList = [{
  label: "第一战区",
  value: 70100,
}, {
  label: "第二战区",
  value: 70200,
}, {
  label: "第三战区",
  value: 70300,
}, {
  label: "第四战区",
  value: 70400,
}, {
  label: "第五战区",
  value: 70500,
}, {
  label: "第六战区",
  value: 70600,
}, {
  label: "第七战区",
  value: 70700,
}, {
  label: "第八战区",
  value: 70800,
}, {
  label: "第九战区",
  value: 70900,
}, {
  label: "第十战区",
  value: 71000,
}, {
  label: "第十一战区",
  value: 71100,
}, {
  label: "第十二战区",
  value: 71200,
}, {
  label: "第十三战区",
  value: 71300,
}, {
  label: "第十四战区",
  value: 71400,
}, {
  label: "第十五战区",
  value: 71500,
}, {
  label: "第十六战区",
  value: 71600,
}];

export const changciList = [{
  label: "八强赛A（左上）",
  value: 1,
}, {
  label: "八强赛B（左下）",
  value: 2,
}, {
  label: "八强赛C（右上）",
  value: 3,
}, {
  label: "八强赛D（右下）",
  value: 4,
}, {
  label: "四强赛AB（左）",
  value: 5,
}, {
  label: "四强赛CD（右）",
  value: 6,
}, {
  label: "季军赛",
  value: 7,
}, {
  label: "冠军赛",
  value: 8,
}];

export const keduList = [{
    label: "顶氪",
    value: 9
}, {
    label: "巨氪",
    value: 8
}, {
    label: "大氪",
    value: 7
}, {
    label: "中大氪",
    value: 6
}, {
    label: "中氪",
    value: 5
}, {
    label: "中低氪",
    value: 4
}, {
    label: "低氪",
    value: 3
}, {
    label: "微氪",
    value: 2
}, {
    label: "零氪",
    value: 1
}];

export const shengfuSelect = [{
    label: "胜",
    value: 1,
}, {
    label: "负",
    value: 2,
}, {
    label: "弃",
    value: 0,
}];

export const qualityList = ["白", "蓝", "紫", "橙"];
export const zhenyinList = ["四芒帝国", "隐秘者", "禅意谷", "天堂港", "炼狱深渊", "蛮石旷野", "冬神使徒"];

function getCardList(data: any) {
  let resData = [];
  for (let i = 0; i < data.length; i++) {
    resData.push({
      name: data[i].name,
      zhenyin: 1,
      grade: "[3]",
      quality: qualityList.findIndex((item: any) => item == data[i].quality) + 1,
      cost: data[i].cost,
      type: data[i].type,
      img: data[i].img,
      data: data[i].data.map((item: any) => {
        return {
          attack: item[0],
          life: item[1],
          effect: item[2]
        }
      })
    });
  }
  return resData;
}

export function getShenqiList(data: any) {
  let resData = []
  for (let i = 0; i < data.length; i++) {
    resData.push({
      name: data[i].name,
      zhenyin: 7,
      quality: qualityList.findIndex((item: any) => item == data[i].quality),
      type: data[i].type,
      img: data[i].img,
      data: data[i].data.map((item: any) => {
        return {
          effect: item[0]
        }
      })
    });
  }
  return resData;
}

export function getHeroList(data: any) {
  let resData = [];
  for (let i = 0; i < data.length; i++) {
    resData.push({
      name: data[i].name,
      zhu: zhenyinList.findIndex((item: any) => item == data[i].zhu) + 1,
      fu: zhenyinList.findIndex((item: any) => item == data[i].fu) + 1,
      quality: qualityList.findIndex((item: any) => item == data[i].quality) + 1,
      skillName: data[i].skillName,
      img: data[i].img,
      data: data[i].data.map((item: any) => {
        return {
          effect: item[0]
        }
      })
    });
  }
  return resData;
}

export const qingshuBase2 = {
  "backgroundTitle": "(1)游戏背景：",
  "background": "每位玩家都将扮演公主的追求者，游戏目的是成为最后一个被淘汰者，这样便可以将自己的情书送给公主，从而获得一颗公主的爱心。 当爱心达到一定数量时，你便可以迎娶公主，走向人生巅峰。",
  "roleTitle": "(2)游戏角色：",
  "roleIntroduce": [
    "1.（侍卫）：共5张。指定一名玩家猜出其一张名字不是侍卫的卡，如果该名玩家持有这张卡，则他淘汰出局。",
    "2.（牧师）：共2张。查看另一名玩家的手牌。",
    "3.（男爵）：共2张。选择另一名玩家，与其比较手牌点数大小，较小者淘汰出局。",
    "4.（侍女）：共2张。直到你的下一个回合，忽略其他玩家的卡牌对你的影响。",
    "5.（王子）：共2张。选择场上一名还在游戏中的玩家，被指定的玩家弃掉手牌，然后摸一张新的牌。",
    "6.（国王）：共1张。将你手上的卡与你选择的另一名玩家交换。",
    "7.（女伯爵）：共1张。如果你手上有女伯爵并且有着国王或者王子的时候，你必须弃置女伯爵。",
    "8.（公主）：共1张。如果你弃置或者打出这张牌，你将直接淘汰出局。"
  ],
  "role": [
    { "id": 1, "name": "侍卫" },
    { "id": 2, "name": "牧师" },
    { "id": 3, "name": "男爵" },
    { "id": 4, "name": "侍女" },
    { "id": 5, "name": "王子" },
    { "id": 6, "name": "国王" },
    { "id": 7, "name": "女伯爵" },
    { "id": 8, "name": "公主" }
  ]
}

export const qingshuBase = {
  "backgroundTitle": "(1)游戏背景：",
  "background": "每位玩家都将借助英灵的力量，最终见到永夜女王，如果你弃掉辉夜女王视为失败。",
  "roleTitle": "(2)游戏角色：",
  "roleIntroduce": [
    "1.（圣堂门卫）：共5张。指定一名玩家猜出其一张名字不是门卫的卡，如果该名玩家持有这张卡，则他淘汰出局。",
    "2.（洞悉之眼）：共2张。查看另一名玩家的手牌。",
    "3.（决斗）：共2张。选择另一名决斗玩家，与其比较手牌点数大小，较小者淘汰出局。",
    "4.（露娜）：共2张。直到你的下一个回合，忽略其他玩家的卡牌对你的影响。",
    "5.（莉莉丝）：共2张。选择场上一名还在游戏中的玩家，被指定的玩家弃掉手牌，然后摸一张新的牌。",
    "6.（大主教）：共1张。将你手上的卡与你选择的另一名玩家交换。",
    "7.（时光米拉）：共1张。如果你手上有时光米拉并且有着大主教或者莉莉丝的时候，你必须弃置时光米拉。",
    "8.（永夜女王）：共1张。如果你弃置或者打出这张牌，你将直接淘汰出局。"
  ],
  "role": [
    { "id": 1, "name": "圣堂门卫" },
    { "id": 2, "name": "洞悉之眼" },
    { "id": 3, "name": "决斗" },
    { "id": 4, "name": "露娜" },
    { "id": 5, "name": "莉莉丝" },
    { "id": 6, "name": "大主教" },
    { "id": 7, "name": "时光米拉" },
    { "id": 8, "name": "永夜女王" }
  ]
}

export function calculateCarsRatio(grade: any) {
  let ss = 0, s = 0, aa = 0, a = 0, b = 0, c = 0, d = 0;
  for (let e of grade) {
    const g = JSON.parse(e.grade)[0];
    if (g == 6) {
      ss++;
    } else if (g == 5) {
      s++;
    } else if (g == 4) {
      aa++;
    } else if (g == 3) {
      a++;
    } else if (g == 2) {
      b++;
    } else if (g == 1) {
      c++;
    } else if (g == 0) {
      d++;
    }
  }
  function youhua(v: number) {
    return (v / 6.35).toFixed(2) + "%";
  }
  const resultData = {
    ss: youhua(ss),
    s: youhua(s),
    aa: youhua(aa),
    a: youhua(a),
    b: youhua(b),
    c: youhua(c),
    d: youhua(d)
  }
  return resultData;
}

export const tabList1 = ["护甲", "回血", "洞察", "传承", "践踏", "先攻", "禁疗", "磐龙", "协战", "穿透", "冰封", "迟缓", "守军", "神佑", "魔免", "魂歌", "隐形", "连击", "亡语", "沉默", "魔防", "跳费", "压费", "召唤"];

export const tabList = [{
  label: "护甲",
  value: 1
}, {
  label: "回血",
  value: 2
}, {
  label: "洞察",
  value: 3
}, {
  label: "传承",
  value: 4
}, {
  label: "践踏",
  value: 5
}, {
  label: "先攻",
  value: 6
}, {
  label: "禁疗",
  value: 7
}, {
  label: "磐龙",
  value: 8
}, {
  label: "协战",
  value: 9
}, {
  label: "穿透",
  value: 10
}, {
  label: "冰封",
  value: 11
}, {
  label: "迟缓",
  value: 12
}, {
  label: "守军",
  value: 13
}, {
  label: "神佑",
  value: 14
}, {
  label: "魔免",
  value: 15
}, {
  label: "魂歌",
  value: 16
}, {
  label: "隐形",
  value: 17
}, {
  label: "连击",
  value: 18
}, {
  label: "亡语",
  value: 19
}, {
  label: "沉默",
  value: 20
}, {
  label: "魔防",
  value: 21
}, {
  label: "压费",
  value: 22
}, {
  label: "跳费",
  value: 23
}, {
  label: "召唤",
  value: 24
}, {
  label: "过牌",
  value: 25
}, {
  label: "机制",
  value: 26
}];

const tabList2 = ["成长", "增益", "减益", "过牌", "吹风", "解卡", "人海", "快攻", "回手", "弃牌", "充能", "法力封锁", "荒芜", "地雷"];

export function allValuesInArray(arr1: string[], arr2: string[]) {
  return arr1.every(value => arr2.includes(value));
}