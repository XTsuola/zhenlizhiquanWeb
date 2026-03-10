<template>
    <div class="main">
        <div class="title">
            <div style="margin-bottom: 8px;">{{ ceshiData.qu }}区-{{ ceshiData.name }}</div>
            <div>
                <img style="height: 50px;width: 50px;border: 1px solid #cccccc;padding: 1px;margin-right: 5px;"
                    :src="heroImg">{{
                        heroName }}
            </div>

        </div>
        <div style="margin-bottom: 10px;">
            当前生命：{{ nowLife }} / 距离满命：{{ maxLfie - nowLife }}
        </div>
        <div class="card">
            <div class="bold">卡等分析：</div>
            <div class="card_body">
                <div class="flex_left">
                    <div style="width: 30%">蓝卡等级：</div><span style="width: 70%;">{{ blueCard.toFixed(2)
                    }} 级</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%">紫卡等级：</div><span style="width: 70%;">{{ purpleCard.toFixed(2)
                    }} 级</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%">橙卡等级：</div><span style="width: 70%;">{{ orangeCard.toFixed(2)
                        }} 级</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%">平均等级：</div><span style="width: 70%;">{{ allCard.toFixed(2)
                    }} 级</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%">蓝卡占比：</div><span style="width: 70%;">{{ ((blueList.length / 30) *
                        100).toFixed(2)
                        }}%（{{ blueList.length }}张）</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%">紫卡占比：</div><span style="width: 70%;">{{ ((purpleList.length / 30) *
                        100).toFixed(2)
                        }}%（{{ purpleList.length }}张）</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%">橙卡占比：</div><span style="width: 70%;">{{ ((goldList.length / 30) *
                        100).toFixed(2)
                        }}%（{{ goldList.length }}张）</span>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="bold">到22级还需要的资源：</div>
            <div class="card_body">
                <div class="flex_left">
                    <div style="width: 30%;">蓝卡：</div><span style="width: 70%;">{{ nowLevel.blue }} 张</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">紫卡：</div><span style="width: 70%;">{{ nowLevel.purple }} 张</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">橙卡：</div><span style="width: 70%;">{{ nowLevel.gold }} 张</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">黄石头：</div><span style="width: 70%;">{{ to22Level.huangshitou -
                        nowLevel.huangshitou > 10000 ?
                        ((to22Level.huangshitou - nowLevel.huangshitou) / 10000).toFixed(2) + " 万" :
                        to22Level.huangshitou
                        - nowLevel.huangshitou }}</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">红石头：</div><span style="width: 70%;">{{ to22Level.hongshitou -
                        nowLevel.hongshitou > 10000 ?
                        ((to22Level.hongshitou - nowLevel.hongshitou) / 10000).toFixed(2) + " 万" :
                        to22Level.hongshitou
                        - nowLevel.hongshitou }}</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">黑石头：</div><span style="width: 70%;">{{ to22Level.heishitou -
                        nowLevel.heishitou > 10000 ?
                        ((to22Level.heishitou - nowLevel.heishitou) / 10000).toFixed(2) + " 万" : to22Level.heishitou
                        - nowLevel.heishitou }}</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">白石头：</div><span style="width: 70%;">{{ to22Level.baishitou -
                        nowLevel.baishitou > 10000 ?
                        ((to22Level.baishitou - nowLevel.baishitou) / 10000).toFixed(2) + " 万" : to22Level.baishitou
                        - nowLevel.baishitou }}</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">钻石：</div><span style="width: 70%;">{{ to22Level.zuanshi -
                        nowLevel.zuanshi > 10000 ?
                        ((to22Level.zuanshi - nowLevel.zuanshi) / 10000).toFixed(2) + " 万" : to22Level.zuanshi
                        - nowLevel.zuanshi }}</span>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="bold">强卡占比：</div>
            <div class="card_body">
                <div class="flex_left">
                    <div style="width: 30%;">SS级：</div><span style="width: 70px;">{{ ((ss / 30) * 100).toFixed(2)
                        }}%</span><span>（{{ ss }}张）</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">S级：</div><span style="width: 70px;">{{ ((s / 30) * 100).toFixed(2)
                        }}%</span><span>（{{ s }}张）</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">A+级：</div><span style="width: 70px;">{{ ((aa / 30) * 100).toFixed(2)
                        }}%</span><span>（{{ aa }}张）</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">A级：</div><span style="width: 70px;">{{ ((a / 30) * 100).toFixed(2)
                        }}%</span><span>（{{ a }}张）</span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">B级：</div><span style="width: 70px;">{{ ((b / 30) *
                        100).toFixed(2)
                        }}%</span><span>（{{ b }}张）<a-button v-if="b > 0" size="small"
                            @click="showCards(2)">查看</a-button></span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">C级：</div><span style="width: 70px;">{{ ((c / 30) *
                        100).toFixed(2)
                        }}%</span><span>（{{ c }}张）<a-button v-if="c > 0" size="small"
                            @click="showCards(1)">查弱</a-button></span>
                </div>
                <div class="flex_left">
                    <div style="width: 30%;">D级：</div><span style="width: 70px;">{{ ((d / 30) *
                        100).toFixed(2)
                        }}%</span><span>（{{ d }}张）<a-button v-if="d > 0" size="small"
                            @click="showCards(0)">查弱</a-button></span>
                </div>
            </div>
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false">
            <img v-for="img in lajiCards" style="width: 40px;height: 40px;" :src="img" />
            <template #footer>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { blueObj, purpleObj, goldObj } from "@/data/z_otherData/cailiao";
import { gradeData } from "@/data/z_otherData/gradeData";
import { heroTable } from "@/data/heroData/index";

export interface HeroType {
    id: number
    name: string
    life: number
}

export interface CeshiDataType {
    qu: number
    name: string
    hero: HeroType
    cardList: string[]
    cardLevel: number[]
}

interface Prop {
    cardData: CeshiDataType
}

const prop = defineProps<Prop>();
const ceshiData = prop.cardData;
let maxLfie = 319;
const heroImg = ref<any>("");
const heroName = ref<any>("");
const nowLife = ref<any>(0);
const ss = ref(0);
const s = ref(0);
const aa = ref(0);
const a = ref(0);
const b = ref(0);
const c = ref(0);
const d = ref(0);
const cardList: string[] = ceshiData.cardList;
const cardLevel: number[] = ceshiData.cardLevel;
const blueList: number[] = [];
const purpleList: number[] = [];
const goldList: number[] = [];
const bImgList = ref<string[]>([]);
const cImgList = ref<string[]>([]);
const dImgList = ref<string[]>([]);
for (let i = 0; i < cardList.length; i++) {
    const obj: any = gradeData.find((e: any) => e.name == cardList[i]);
    const grade = JSON.parse(obj.grade)[0];
    const qulaity = obj.quality;
    if (qulaity == 4) goldList.push(cardLevel[i]);
    else if (qulaity == 3) purpleList.push(cardLevel[i]);
    else if (qulaity == 2) blueList.push(cardLevel[i]);
    if (grade == 6) {
        ss.value++;
    } else if (grade == 5) {
        s.value++;
    } else if (grade == 4) {
        aa.value++;
    } else if (grade == 3) {
        a.value++;
    } else if (grade == 2) {
        b.value++;
        bImgList.value.push(obj.img);
    }
    else if (grade == 1) {
        c.value++;
        cImgList.value.push(obj.img);
    }
    else if (grade == 0) {
        d.value++;
        dImgList.value.push(obj.img);
    }
}
const nowImg: any = heroTable.find((e: any) => e.id == ceshiData.hero.id)?.img;
heroImg.value = import.meta.env.VITE_APP_BASE_URL + "heroImg" + nowImg;
heroName.value = heroTable.find((e: any) => e.id == ceshiData.hero.id)?.name;
nowLife.value = ceshiData.hero.life;
const to22Level = reactive<any>({
    baishitou: 0,
    heishitou: 0,
    hongshitou: 0,
    huangshitou: 0,
    zuanshi: 0,
    zhanli: 0,
});
const nowLevel = reactive<any>({
    baishitou: 0,
    heishitou: 0,
    hongshitou: 0,
    huangshitou: 0,
    zuanshi: 0,
    zhanli: 0,
    blue: 0,
    purple: 0,
    gold: 0
});
const blueCard = ref(0);
const purpleCard = ref(0);
const orangeCard = ref(0);
const allCard = ref(0);

async function getList() {
    let blueLevel = 0, purpleLevel = 0, goldLevel = 0;
    for (let i = 0; i < blueList.length; i++) {
        blueLevel += blueList[i];
        nowLevel.baishitou += blueObj[blueList[i] - 1].cailiao[3];
        nowLevel.heishitou += blueObj[blueList[i] - 1].cailiao[2];
        nowLevel.hongshitou += blueObj[blueList[i] - 1].cailiao[1];
        nowLevel.huangshitou += blueObj[blueList[i] - 1].cailiao[0];
        nowLevel.zuanshi += blueObj[blueList[i] - 1].zuanshi;
        nowLevel.zhanli += blueObj[blueList[i] - 1].zhanli;
        nowLevel.blue += (4864 - blueObj[blueList[i] - 1].count);
    }
    for (let i = 0; i < purpleList.length; i++) {
        purpleLevel += purpleList[i];
        nowLevel.baishitou += purpleObj[purpleList[i] - 1].cailiao[3];
        nowLevel.heishitou += purpleObj[purpleList[i] - 1].cailiao[2];
        nowLevel.hongshitou += purpleObj[purpleList[i] - 1].cailiao[1];
        nowLevel.huangshitou += purpleObj[purpleList[i] - 1].cailiao[0];
        nowLevel.zuanshi += purpleObj[purpleList[i] - 1].zuanshi;
        nowLevel.zhanli += purpleObj[purpleList[i] - 1].zhanli;
        nowLevel.purple += (3200 - purpleObj[purpleList[i] - 1].count);
    }
    for (let i = 0; i < goldList.length; i++) {
        goldLevel += goldList[i];
        nowLevel.baishitou += goldObj[goldList[i] - 1].cailiao[3];
        nowLevel.heishitou += goldObj[goldList[i] - 1].cailiao[2];
        nowLevel.hongshitou += goldObj[goldList[i] - 1].cailiao[1];
        nowLevel.huangshitou += goldObj[goldList[i] - 1].cailiao[0];
        nowLevel.zuanshi += goldObj[goldList[i] - 1].zuanshi;
        nowLevel.zhanli += goldObj[goldList[i] - 1].zhanli;
        nowLevel.gold += (2112 - goldObj[goldList[i] - 1].count);
    }
    blueCard.value = blueLevel / blueList.length;
    purpleCard.value = purpleLevel / purpleList.length;
    orangeCard.value = goldLevel / goldList.length;
    allCard.value = (blueLevel + purpleLevel + goldLevel) / (blueList.length + purpleList.length + goldList.length);
    to22Level.baishitou = (blueList.length * blueObj[21].cailiao[3]) + (purpleList.length * purpleObj[21].cailiao[3]) + (goldList.length * goldObj[21].cailiao[3]);
    to22Level.heishitou = (blueList.length * blueObj[21].cailiao[2]) + (purpleList.length * purpleObj[21].cailiao[2]) + (goldList.length * goldObj[21].cailiao[2]);
    to22Level.hongshitou = (blueList.length * blueObj[21].cailiao[1]) + (purpleList.length * purpleObj[21].cailiao[1]) + (goldList.length * goldObj[21].cailiao[1]);
    to22Level.huangshitou = (blueList.length * blueObj[21].cailiao[0]) + (purpleList.length * purpleObj[21].cailiao[0]) + (goldList.length * goldObj[21].cailiao[0]);
    to22Level.zuanshi = (blueList.length * blueObj[21].zuanshi) + (purpleList.length * purpleObj[21].zuanshi) + (goldList.length * goldObj[21].zuanshi);
    to22Level.zhanli = (blueList.length * blueObj[21].zhanli) + (purpleList.length * purpleObj[21].zhanli) + (goldList.length * goldObj[21].zhanli);
}

const lajiCards = ref<any>([]);
const visible = ref(false);
const title = ref("弱卡展示");
function showCards(type: number) {
    visible.value = true;
    if (type == 2) {
        title.value = "B级弱卡展示";
        lajiCards.value = bImgList.value.map((e: string) => import.meta.env.VITE_APP_BASE_URL + "cardImg" + e);
    } else if (type == 1) {
        title.value = "C级弱卡展示";
        lajiCards.value = cImgList.value.map((e: string) => import.meta.env.VITE_APP_BASE_URL + "cardImg" + e);
    } else {
        title.value = "D级弱卡展示";
        lajiCards.value = dImgList.value.map((e: string) => import.meta.env.VITE_APP_BASE_URL + "cardImg" + e);
    }
}

onMounted(() => {
    getList();
})

</script>

<style lang="less" scoped>
.main {
    padding: 20px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;

    .title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 15px 15px 0;
    }

    .searchHead {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .cardLevel {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 8px;

        span {
            margin-right: 50px;
        }
    }

    .card {
        width: 100%;
        border: 2px solid #cccccc;
        padding: 8px;
        border-radius: 5px;
        margin-bottom: 10px;

        .card_body {
            display: flex;
            justify-content: flex-start;
            flex-direction: column;
        }
    }

    .bold {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .flex_left {
        display: flex;
        justify-self: flex-start;
    }
}
</style>