<template>
    <div class="home">
        <div class="home_top">
            <div class="zhongzu simangdiguo">
                <div><img class="img" src="@/assets/fengmian/simangdiguo.jpg" /></div>
                <div>四芒帝国</div>
                <div class="center" @click="goCard(1)">部下</div>
                <div class="center" @click="goShenqi(1)">神器</div>
                <div class="center" @click="goChongwu(1)">近卫</div>
            </div>
            <div class="zhongzu yinmizhe">
                <div><img class="img" src="@/assets/fengmian/yinmizhe.jpg" /></div>
                <div>隐秘者</div>
                <div class="center" @click="goCard(2)">部下</div>
                <div class="center" @click="goShenqi(2)">神器</div>
                <div class="center" @click="goChongwu(2)">近卫</div>
            </div>
            <div class="zhongzu chanyigu">
                <div><img class="img" src="@/assets/fengmian/chanyigu.jpg" /></div>
                <div>禅意谷</div>
                <div class="center" @click="goCard(3)">部下</div>
                <div class="center" @click="goShenqi(3)">神器</div>
                <div class="center" @click="goChongwu(3)">近卫</div>
            </div>
            <div class="zhongzu tiantanggang">
                <div><img class="img" src="@/assets/fengmian/tiantanggang.jpg" /></div>
                <div>天堂港</div>
                <div class="center" @click="goCard(4)">部下</div>
                <div class="center" @click="goShenqi(4)">神器</div>
                <div class="center" @click="goChongwu(4)">近卫</div>
            </div>
            <div class="zhongzu lianyushenyuan">
                <div><img class="img" src="@/assets/fengmian/lianyushenyuan.jpg" /></div>
                <div>炼狱深渊</div>
                <div class="center" @click="goCard(5)">部下</div>
                <div class="center" @click="goShenqi(5)">神器</div>
                <div class="center" @click="goChongwu(5)">近卫</div>
            </div>
            <div class="zhongzu manshikuangye">
                <div><img class="img" src="@/assets/fengmian/manshikuangye.jpg" /></div>
                <div>蛮石旷野</div>
                <div class="center" @click="goCard(6)">部下</div>
                <div class="center" @click="goShenqi(6)">神器</div>
                <div class="center" @click="goChongwu(6)">近卫</div>
            </div>
            <div class="zhongzu dongshenshitu">
                <div><img class="img" src="@/assets/fengmian/dongshenshitu.jpg" /></div>
                <div>冬神使徒</div>
                <div class="center" @click="goCard(7)">部下</div>
                <div class="center" @click="goShenqi(7)">神器</div>
                <div class="center" @click="goChongwu(7)">近卫</div>
            </div>
        </div>
        <div class="home_bottom">
            <div class="box simangdiguo white" @click="goYiji()">
                遗迹奖励
            </div>
            <!-- <div class="box yinmizhe white" @click="goTools()">
                计算工具
            </div> -->
            <div class="box yinmizhe white" @click="goSkinDiyList()">
                皮肤工坊
            </div>
            <div class="box chanyigu white" @click="goResource()">
                资源查询
            </div>
            <div class="box tiantanggang white" @click="uploadCard()">
                卡组分享
            </div>
            <div class="box lianyushenyuan white" @click="goHeroList()">
                英雄统计
            </div>
            <div class="box chongwu_bg white" @click="goChongwuSkillList()">
                近卫技能
            </div>
            <div class="box bg_cyan white" @click="goShardList()">
                英雄碎片
            </div>
            <div class="box manshikuangye white" @click="goSkinList()">
                皮肤满星
            </div>
            <div class="box bg_black white" @click="goPaixu()">
                卡牌评级
            </div>
            <div class="box bg_blue white" @click="goTagList()">
                卡牌标签
            </div>
            <div class="box bg_pink white" @click="goShijiesai()">
                比赛统计
            </div>
            <div class="box bg_grey white" @click="goNote()">
                留言建议
            </div>
            <div class="box2 dongshenshitu white" @click="goMsgDetail()">
                今日查询数：{{ count }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { logList, logAdd } from '@/api/log';
import router from '@/router';

const count = ref(0);
const zhenyinNameList = [{
    id: 1,
    name_cn: "帝国",
    name_en: "simangdiguo"
}, {
    id: 2,
    name_cn: "隐秘",
    name_en: "yinmizhe"
}, {
    id: 3,
    name_cn: "禅意",
    name_en: "chanyigu"
}, {
    id: 4,
    name_cn: "海港",
    name_en: "tiantanggang"
}, {
    id: 5,
    name_cn: "炼狱",
    name_en: "lianyushenyuan"
}, {
    id: 6,
    name_cn: "蛮石",
    name_en: "manshikuangye"
}, {
    id: 7,
    name_cn: "冬神",
    name_en: "dongshenshitu"
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

function goYiji() {
    createLog("查询遗迹");
    router.push("/yiji");
}

function goTools() {
    createLog("查询计算");
    router.push("/shenqiTools");
}

function goResource() {
    createLog("查询资源");
    router.push("/resource");
}

function goHeroList() {
    createLog("查询英雄");
    router.push("/heroList");
}

function goChongwuSkillList() {
    createLog("查询近卫");
    router.push("/chongwuSkillList");
}

function goShardList() {
    createLog("查询碎片");
    router.push("/shardList");
}

function goSkinList() {
    createLog("查询皮肤");
    router.push("/skinList");
}

function goSkinDiyList() {
    createLog("查询皮肤");
    router.push("/skinDiyList");
}

function goPaixu() {
    createLog("查询评级");
    router.push("/cardGrade");
}

function goShijiesai() {
    createLog("查询比赛");
    router.push("/gameMenu");
}

function goTagList() {
    createLog("查询标签");
    router.push("/cardTag");
}

function uploadCard() {
    router.push("/cardsUpload");
}

function goNote() {
    createLog("查询留言");
    router.push("/note");
}

function goMsgDetail() {
    router.push("/msgDetail");
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

            img {
                height: 4em;
                border-radius: 50%;
                border: 1px solid #ffffff;
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

    .simangdiguo {
        background-color: orange;
    }

    .chanyigu {
        background-color: green;
    }

    .yinmizhe {
        background-color: purple;
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

    .chongwu_bg {
        background-color: #9bc505;
    }

    .white {
        color: white;
    }

    .bg_black {
        background-color: black;
    }

    .bg_pink {
        background-color: rgb(224, 141, 155);
    }

    .bg_blue {
        background-color: rgb(39, 39, 219);
    }

    .bg_grey {
        background-color: grey;
    }

    .bg_cyan {
        background-color: #15a0a0;
    }
}
</style>