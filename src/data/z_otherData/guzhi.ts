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
            { name: "钻石", value: 0.003227 },
            { name: "蜡烛", value: 4.09 },
            { name: "粉尘", value: 0.00077 },
            { name: "橙券", value: 4.88 },
            { name: "橙色万变", value: 30.8 },
            { name: "紫券", value: 0.781 },
            { name: "紫色万变", value: 4.89 },
            { name: "蓝券", value: 0.194 },
            { name: "蓝色万变", value: 0.42 },
            { name: "红色陨铁", value: 0.0452 },
            { name: "橙色陨铁", value: 0.0111 },
            { name: "红色罐子", value: 0.24 },
            { name: "橙色罐子", value: 0.087 },
            { name: "召唤石", value: 0.46 },
            { name: "神器钥匙", value: 0.465 },
            { name: "异界币", value: 0.0753 },
            { name: "公会币", value: 0.01 },
            { name: "生命石", value: 0.4 },
            { name: "橙色英雄", value: 44.04 },
            { name: "紫色英雄", value: 22.59 },
            { name: "蓝色英雄", value: 12.91 },
            { name: "白色英雄", value: 5.24 },
            { name: "橙色神器", value: 16.26 },
            { name: "紫色神器", value: 0.97 },
            { name: "蓝色神器", value: 0.1 }
        ]
    },
    {
        key: "other",
        label: "其他资源",
        color: "#8e488e",
        list: [
            { name: "紫色陨铁", value: 0.0027 },
            { name: "蓝色陨铁", value: 0.0005 },
            { name: "红色星辰精华", value: 0.0636 },
            { name: "紫色星辰精华", value: 0.0161 },
            { name: "白色技能觉醒石", value: 16.86 },
            { name: "黑色技能觉醒石", value: 10.6 },
            { name: "红色技能觉醒石", value: 5.43 },
            { name: "周活动宝剑", value: 0.496 },
            { name: "周活动镐子", value: 0.16 },
            { name: "镜子", value: 0.65 },
            { name: "炫金石头", value: 0.078 },
            { name: "黑曜石头", value: 0.06453 },
            { name: "红色石头", value: 0.01093 },
            { name: "黄色石头", value: 0.00193 },
            { name: "紫色罐子", value: 0.039 },
            { name: "蓝色罐子", value: 0.014 },
            { name: "白色罐子", value: 0.005 },
            { name: "祭坛石头", value: 0.003 },
            { name: "1W金币", value: 0.0022 },
            { name: "羽毛", value: 0.0017 },
            { name: "红色能量石", value: 0.3868 },
            { name: "橙色能量石", value: 0.1286 },
            { name: "紫色能量石", value: 0.0428 },
            { name: "蓝色能量石", value: 0.0142 },
            { name: "白色能量石", value: 0.0043 }
        ]
    },
    {
        key: "chongwu",
        label: "近卫等资源",
        color: "#e67e22",
        list: [
            { name: "橙色近卫", value: 112.94 },
            { name: "紫色近卫", value: 30.12 },
            { name: "蓝色近卫", value: 14.46 },
            { name: "白色近卫", value: 6.85 },
            { name: "高级洗练石", value: 3.61 },
            { name: "洗练石", value: 0.52 },
            { name: "记忆水晶", value: 0.23 },
            { name: "契约之证", value: 0.87 },
            { name: "近卫精华", value: 0.01613 },
            { name: "重置沙漏", value: 1.0039 },
            { name: "重置锤子", value: 1.0039 },
            { name: "时空精华", value: 0.08 },
            { name: "刷新令", value: 0.02 },
            { name: "地城钥匙", value: 49.28 },
            { name: "珠子", value: 0.214 },
            { name: "魔盒券", value: 0.04542 },
            { name: "征收令", value: 0.3239 },
            { name: "战令", value: 85 },
            { name: "粉尘月卡", value: 385 },
            { name: "荣耀征程", value: 100 }
        ]
    }
];
