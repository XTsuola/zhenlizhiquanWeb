<template>
    <div class="home">
        <div class="home_top">
            <div v-for="item in zhenyinNameList" class="zhongzu" :class="item.name_en">
                <div class="relative">
                    <img class="tubiao" :src="item.tubiao" />
                    <img class="img" :src="item.touxiang" />
                </div>
                <div class="center" @click="goCard(item.id)">部下</div>
                <div class="center" @click="goShenqi(item.id)">神器</div>
                <div class="center" @click="goChongwu(item.id)">近卫</div>
            </div>
        </div>
        <div class="home_bottom">
            <div v-for="item in whereList" class="box white" :style="{ 'backgroundColor': item.bgColor }"
                @click="goWhere(item)">
                {{ item.name }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { logList, logAdd } from '@/api/log';
import router from '@/router';

const count = ref(0);
const zhenyinNameList: any = [{
    id: 1,
    name_cn: "帝国",
    name_en: "simangdiguo",
    touxiang: new URL("@/assets/fengmian/simangdiguo.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/simangdiguo.png", import.meta.url)
}, {
    id: 2,
    name_cn: "隐秘",
    name_en: "yinmizhe",
    touxiang: new URL("@/assets/fengmian/yinmizhe.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/yinmizhe.png", import.meta.url)
}, {
    id: 3,
    name_cn: "禅意",
    name_en: "chanyigu",
    touxiang: new URL("@/assets/fengmian/chanyigu.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/chanyigu.png", import.meta.url)
}, {
    id: 4,
    name_cn: "海港",
    name_en: "tiantanggang",
    touxiang: new URL("@/assets/fengmian/tiantanggang.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/tiantanggang.png", import.meta.url)
}, {
    id: 5,
    name_cn: "炼狱",
    name_en: "lianyushenyuan",
    touxiang: new URL("@/assets/fengmian/lianyushenyuan.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/lianyushenyuan.png", import.meta.url)
}, {
    id: 6,
    name_cn: "蛮石",
    name_en: "manshikuangye",
    touxiang: new URL("@/assets/fengmian/manshikuangye.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/manshikuangye.png", import.meta.url)
}, {
    id: 7,
    name_cn: "冬神",
    name_en: "dongshenshitu",
    touxiang: new URL("@/assets/fengmian/dongshenshitu.jpg", import.meta.url),
    tubiao: new URL("@/assets/zhongzu/dongshenshitu.png", import.meta.url)
}];
const whereList: any = [{
    name: "遗迹奖励",
    url: "/yiji",
    bgColor: "#ffa500",
    log: "查询遗迹"
}, {
    name: "计算工具",
    url: "/menuTools",
    bgColor: "#03a1c9",
    log: "查询计算"
}, {
    name: "资源查询",
    url: "/resource",
    bgColor: "#008000",
    log: "查询资源"
}, {
    name: "卡组分享",
    url: "/cardsUpload",
    bgColor: "#0e5d92",
    log: "分享卡组"
}, {
    name: "英雄统计",
    url: "/heroList",
    bgColor: "#c01b10",
    log: "查询英雄"
}, {
    name: "近卫技能",
    url: "/chongwuSkillList",
    bgColor: "#9bc505",
    log: "查询近卫"
}, {
    name: "英雄碎片",
    url: "/shardList",
    bgColor: "#15a0a0",
    log: "查询碎片"
}, {
    name: "皮肤查询",
    url: "/skinList",
    bgColor: "#804400",
    log: "查询皮肤"
}, {
    name: "卡牌评级",
    url: "/cardGrade",
    bgColor: "#000000",
    log: "查询评级"
}, {
    name: "卡牌标签",
    url: "/cardTag",
    bgColor: "#2727db",
    log: "查询标签"
}, {
    name: "比赛统计",
    url: "/gameMenu",
    bgColor: "#e08d9b",
    log: "查询比赛"
}, {
    name: "AI交流",
    url: "/deepseek",
    bgColor: "#808080",
    log: "查询AI"
}, {
    name: "卡牌工坊",
    url: "/cardDiyList",
    bgColor: "#800080",
    log: "查询卡牌"
}, {
    name: "皮肤许愿",
    url: "/skinDiyList",
    bgColor: "#800080",
    log: "查询皮肤"
}, {
    name: "每日一题",
    url: "/question",
    bgColor: "#03a1c9",
    log: "查询答题"
}, {
    name: "留言建议",
    url: "/note",
    bgColor: "#808080",
    log: "查询留言"
}];

function goCard(id: number) {
    createLog("查询卡牌");
    sessionStorage.setItem("zhenyin", id.toString());
    router.push("/zhongzu");
}

function goShenqi(id: number) {
    sessionStorage.setItem("shenqi", id.toString());
    createLog("查询神器");
    router.push("/shenqi");
}

function goChongwu(id: number) {
    const params = {
        id: id,
        name_cn: zhenyinNameList[id - 1].name_cn,
        name_en: zhenyinNameList[id - 1].name_en
    };
    sessionStorage.setItem("chongwuParams", JSON.stringify(params));
    createLog("查询近卫");
    router.push("/chongwu");
}

function goWhere(obj: any) {
    createLog(obj.log);
    router.push(obj.url);
}

async function createLog(name: string) {
    await logAdd(name);
}

async function getTodayCount() {
    const res = await logList();
    if (res.data.code == 200) {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const list = res.data.data.filter((e: any) => new Date(e.time) > todayMidnight && new Date(e.time) < tomorrowMidnight);
        count.value = list.length;
    }
}

onMounted(() => {
    getTodayCount();
})

</script>

<style lang="less" scoped>
.home {
    font-size: 14px;

    .home_top {
        margin-bottom: 20px;

        .zhongzu {
            width: 100%;
            height: 5em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            margin-bottom: 10px;

            .img {
                height: 4em;
                border-radius: 50%;
                border: 1px solid #ffffff;
            }

            .tubiao {
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                position: absolute;
                width: 25px;
                height: 25px;
                left: -5px;
                top: -5px;
            }
        }

        .center {
            height: 80%;
            width: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            border: 1px solid #ffffff;
        }
    }

    .home_bottom {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        row-gap: 15px;
        column-gap: 4%;
        padding: 5px;

        .box {
            width: 22%;
            height: 40px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .box2 {
            width: 100%;
            height: 40px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .relative {
        position: relative;
    }

    .simangdiguo {
        background-color: #ffa500;
    }

    .chanyigu {
        background-color: #008000;
    }

    .yinmizhe {
        background-color: #800080;
    }

    .manshikuangye {
        background-color: #804400;
    }

    .dongshenshitu {
        background-color: #03a1c9;
    }

    .tiantanggang {
        background-color: #0e5d92;
    }

    .lianyushenyuan {
        background-color: #c01b10;
    }

    .white {
        color: white;
    }
}
</style>