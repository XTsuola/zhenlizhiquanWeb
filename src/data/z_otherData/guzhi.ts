/** 资源估值表（钻石口径） */
export type GuzhiItem = {
    name: string;
    value: number;
};

export type GuzhiSection = {
    key: string;
    label: string;
    color: string;
    list: GuzhiItem[];
};

export const guzhiSections: GuzhiSection[] = [
    {
        key: "common",
        label: "常用资源",
        color: "#4f9bc4",
        list: [
            { name: "100钻石", value: 0.30 },
            { name: "蜡烛", value: 2.00 },
            { name: "1000粉尘", value: 0.80 },
            { name: "橙券", value: 2.30 },
            { name: "橙色万变", value: 7.70 },
            { name: "紫券", value: 0.50 },
            { name: "紫色万变", value: 0.90 },
            { name: "蓝券", value: 0.10 },
            { name: "蓝色万变", value: 0.20 },
            { name: "100红色陨铁", value: 4.50 },
            { name: "100橙色陨铁", value: 1.00 },
            { name: "红色罐子", value: 0.17 },
            { name: "橙色罐子", value: 0.07 },
            { name: "召唤石", value: 0.30 },
            { name: "神器钥匙", value: 0.30 },
            { name: "异界币", value: 0.10 },
            { name: "公会币", value: 0.01 },
            { name: "生命石", value: 0.25 },
            { name: "橙色英雄", value: 26.00 },
            { name: "紫色英雄", value: 16.00 },
            { name: "蓝色英雄", value: 10.50 },
            { name: "白色英雄", value: 4.50 },
            { name: "橙色神器", value: 13.00 },
            { name: "紫色神器", value: 0.80 },
            { name: "蓝色神器", value: 0.10 }
        ]
    },
    {
        key: "other",
        label: "其他资源",
        color: "#8e488e",
        list: [
            { name: "100紫色陨铁", value: 0.25 },
            { name: "100蓝色陨铁", value: 0.05 },
            { name: "100红色星辰精华", value: 5.00 },
            { name: "100紫色星辰精华", value: 1.50 },
            { name: "白色技能觉醒石", value: 14.00 },
            { name: "黑色技能觉醒石", value: 7.30 },
            { name: "红色技能觉醒石", value: 3.20 },
            { name: "周活动宝剑", value: 0.53 },
            { name: "周活动镐子", value: 0.47 },
            { name: "镜子", value: 0.80 },
            { name: "炫金石头", value: 0.02 },
            { name: "黑曜石头", value: 0.04 },
            { name: "红色石头", value: 0.01 },
            { name: "黄色石头", value: 0.01 },
            { name: "紫色罐子", value: 0.03 },
            { name: "蓝色罐子", value: 0.02 },
            { name: "白色罐子", value: 0.01 },
            { name: "祭坛石头", value: 0.01 },
            { name: "100W金币", value: 0.20 },
            { name: "羽毛", value: 0.01 },
            { name: "红色能量石", value: 0.10 },
            { name: "橙色能量石", value: 0.05 },
            { name: "紫色能量石", value: 0.03 },
            { name: "蓝色能量石", value: 0.02 },
            { name: "白色能量石", value: 0.01 }
        ]
    },
    {
        key: "chongwu",
        label: "近卫等资源",
        color: "#e67e22",
        list: [
            { name: "橙色近卫", value: 100.00 },
            { name: "紫色近卫", value: 28.00 },
            { name: "蓝色近卫", value: 12.00 },
            { name: "白色近卫", value: 5.00 },
            { name: "高级洗练石", value: 10.80 },
            { name: "洗练石", value: 0.50 },
            { name: "记忆水晶", value: 0.05 },
            { name: "契约之证", value: 0.50 },
            { name: "1000近卫精华", value: 1.20 },
            { name: "重置沙漏", value: 0.80 },
            { name: "重置锤子", value: 1.00 },
            { name: "时空精华", value: 0.17 },
            { name: "刷新令", value: 0.02 },
            { name: "地城钥匙", value: 59.50 },
            { name: "珠子", value: 0.53 },
            { name: "10魔盒券", value: 0.50 },
            { name: "征收令", value: 0.30 },
            { name: "战令", value: 80 },
            { name: "粉尘月卡", value: 400 },
            { name: "荣耀征程", value: 90 }
        ]
    }
];
