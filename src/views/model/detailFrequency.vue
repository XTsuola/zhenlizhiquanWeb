<template>
    <div class="main">
        <div class="head">
            <div class="head-meta">
                <h3 class="title">{{ ceshiData.qu }}区 · {{ ceshiData.name }}</h3>
                <div class="life">当前生命：{{ nowLife }} / 距离满命：{{ maxLfie - nowLife }}</div>
            </div>
            <div class="hero">
                <img class="hero-img" :src="heroImg" :alt="heroName" />
                <span class="hero-name">{{ heroName }}</span>
            </div>
        </div>
        <div class="card">
            <div class="bold">卡等分析</div>
            <div class="card_body">
                <div class="flex_left">
                    <div class="label">蓝卡等级</div>
                    <span class="value">{{ blueCard.toFixed(2) }} 级</span>
                </div>
                <div class="flex_left">
                    <div class="label">紫卡等级</div>
                    <span class="value">{{ purpleCard.toFixed(2) }} 级</span>
                </div>
                <div class="flex_left">
                    <div class="label">橙卡等级</div>
                    <span class="value">{{ orangeCard.toFixed(2) }} 级</span>
                </div>
                <div class="flex_left">
                    <div class="label">平均等级</div>
                    <span class="value">{{ allCard.toFixed(2) }} 级</span>
                </div>
                <div class="flex_left">
                    <div class="label">蓝卡占比</div>
                    <span class="value">{{ ((blueList.length / 30) * 100).toFixed(2) }}%（{{ blueList.length }}张）</span>
                </div>
                <div class="flex_left">
                    <div class="label">紫卡占比</div>
                    <span class="value">{{ ((purpleList.length / 30) * 100).toFixed(2) }}%（{{ purpleList.length
                    }}张）</span>
                </div>
                <div class="flex_left">
                    <div class="label">橙卡占比</div>
                    <span class="value">{{ ((goldList.length / 30) * 100).toFixed(2) }}%（{{ goldList.length }}张）</span>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="bold">到24级还需要的资源</div>
            <div class="card_body">
                <div class="flex_left">
                    <div class="label">蓝卡</div>
                    <span class="value">{{ nowLevel.blue }} 张</span>
                </div>
                <div class="flex_left">
                    <div class="label">紫卡</div>
                    <span class="value">{{ nowLevel.purple }} 张</span>
                </div>
                <div class="flex_left">
                    <div class="label">橙卡</div>
                    <span class="value">{{ nowLevel.gold }} 张</span>
                </div>
                <div class="flex_left">
                    <div class="label">黄石头</div>
                    <span class="value">{{ formatRes(to24Level.huangshitou - nowLevel.huangshitou) }}</span>
                </div>
                <div class="flex_left">
                    <div class="label">红石头</div>
                    <span class="value">{{ formatRes(to24Level.hongshitou - nowLevel.hongshitou) }}</span>
                </div>
                <div class="flex_left">
                    <div class="label">黑石头</div>
                    <span class="value">{{ formatRes(to24Level.heishitou - nowLevel.heishitou) }}</span>
                </div>
                <div class="flex_left">
                    <div class="label">白石头</div>
                    <span class="value">{{ formatRes(to24Level.baishitou - nowLevel.baishitou) }}</span>
                </div>
                <div class="flex_left">
                    <div class="label">钻石</div>
                    <span class="value">{{ formatRes(to24Level.zuanshi - nowLevel.zuanshi) }}</span>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="bold">强卡占比</div>
            <div class="card_body">
                <div class="flex_left" v-for="item in gradeRows" :key="item.key">
                    <div class="label">{{ item.label }}</div>
                    <span class="value pct">{{ ((item.count / 30) * 100).toFixed(2) }}%</span>
                    <span class="value count">
                        （{{ item.count }}张）
                        <a-button v-if="item.count > 0" size="small" @click="showCards(item.type)">
                            {{ item.btn }}
                        </a-button>
                    </span>
                </div>
            </div>
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false" :width="360">
            <div class="modal-cards">
                <img v-for="(obj, idx) in lajiCards" :key="idx" class="modal-card" :src="obj.img" :alt="obj.name"
                    @click="showDetail(obj)" />
            </div>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose title="详细信息" :maskClosable="false" :width="360">
            <Detail :detailData="detailData" />
            <template #footer>
                <a-button @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from "vue";
import { blueObj, purpleObj, goldObj } from "@/data/z_otherData/cailiao";
import { heroTable } from "@/data/heroData/index";
const Detail = defineAsyncComponent(() => import("./detailCard.vue"));

export interface HeroType {
    id: number;
    name: string;
    life: number;
}

export interface CeshiDataType {
    qu: number;
    name: string;
    hero: HeroType;
    cardList: string[];
    cardLevel: number[];
}

interface Prop {
    cardData: CeshiDataType;
}

const prop = defineProps<Prop>();
const ceshiData = prop.cardData;
const maxLfie = 349;
const heroImg = ref("");
const heroName = ref("");
const nowLife = ref(0);
const sss = ref(0);
const ss = ref(0);
const s = ref(0);
const a = ref(0);
const b = ref(0);
const c = ref(0);
const d = ref(0);
const cardList: string[] = ceshiData.cardList;
const cardLevel: number[] = ceshiData.cardLevel;
const blueList = ref<number[]>([]);
const purpleList = ref<number[]>([]);
const goldList = ref<number[]>([]);
const sssImgList = ref<any[]>([]);
const ssImgList = ref<any[]>([]);
const sImgList = ref<any[]>([]);
const aImgList = ref<any[]>([]);
const bImgList = ref<any[]>([]);
const cImgList = ref<any[]>([]);
const dImgList = ref<any[]>([]);

const to24Level = reactive({
    baishitou: 0,
    heishitou: 0,
    hongshitou: 0,
    huangshitou: 0,
    zuanshi: 0,
    zhanli: 0
});
const nowLevel = reactive({
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
const visible2 = ref(false);
const lajiCards = ref<any[]>([]);
const visible = ref(false);
const title = ref("弱卡展示");
const gradeRows = computed(() => [
    { key: "sss", label: "SSS级", count: sss.value, type: 6, btn: "查看" },
    { key: "ss", label: "SS级", count: ss.value, type: 5, btn: "查看" },
    { key: "s", label: "S级", count: s.value, type: 4, btn: "查看" },
    { key: "a", label: "A级", count: a.value, type: 3, btn: "查看" },
    { key: "b", label: "B级", count: b.value, type: 2, btn: "查看" },
    { key: "c", label: "C级", count: c.value, type: 1, btn: "查弱" },
    { key: "d", label: "D级", count: d.value, type: 0, btn: "查弱" }
]);

function formatRes(n: number) {
    return n > 10000 ? (n / 10000).toFixed(2) + " 万" : String(n);
}

function mapCard(e: any) {
    return {
        img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + e.img,
        id: e.id,
        zhenyin: e.zhenyin,
        name: e.name,
        quality: e.quality,
        cost: e.cost,
        type: e.type,
        grade: e.grade,
        data: e.data
    };
}

async function initCards() {
    const { gradeData } = await import("@/data/z_otherData/gradeData");
    const blues: number[] = [];
    const purples: number[] = [];
    const golds: number[] = [];
    for (let i = 0; i < cardList.length; i++) {
        const obj: any = gradeData.find((e: any) => e.name == cardList[i]);
        if (!obj) continue;
        const grade = JSON.parse(obj.grade)[0];
        const qulaity = obj.quality;
        if (qulaity == 4) golds.push(cardLevel[i]);
        else if (qulaity == 3) purples.push(cardLevel[i]);
        else if (qulaity == 2) blues.push(cardLevel[i]);
        if (grade >= 6) {
            sss.value++;
            sssImgList.value.push(obj);
        } else if (grade == 5) {
            ss.value++;
            ssImgList.value.push(obj);
        } else if (grade == 4) {
            s.value++;
            sImgList.value.push(obj);
        } else if (grade == 3) {
            a.value++;
            aImgList.value.push(obj);
        } else if (grade == 2) {
            b.value++;
            bImgList.value.push(obj);
        } else if (grade == 1) {
            c.value++;
            cImgList.value.push(obj);
        } else if (grade == 0) {
            d.value++;
            dImgList.value.push(obj);
        }
    }
    blueList.value = blues;
    purpleList.value = purples;
    goldList.value = golds;
}

function getList() {
    let blueLevel = 0;
    let purpleLevel = 0;
    let goldLevel = 0;
    const blues = blueList.value;
    const purples = purpleList.value;
    const golds = goldList.value;
    for (let i = 0; i < blues.length; i++) {
        blueLevel += blues[i];
        nowLevel.baishitou += blueObj[blues[i] - 1].cailiao[3];
        nowLevel.heishitou += blueObj[blues[i] - 1].cailiao[2];
        nowLevel.hongshitou += blueObj[blues[i] - 1].cailiao[1];
        nowLevel.huangshitou += blueObj[blues[i] - 1].cailiao[0];
        nowLevel.zuanshi += blueObj[blues[i] - 1].zuanshi;
        nowLevel.zhanli += blueObj[blues[i] - 1].zhanli;
        nowLevel.blue += 6528 - blueObj[blues[i] - 1].count;
    }
    for (let i = 0; i < purples.length; i++) {
        purpleLevel += purples[i];
        nowLevel.baishitou += purpleObj[purples[i] - 1].cailiao[3];
        nowLevel.heishitou += purpleObj[purples[i] - 1].cailiao[2];
        nowLevel.hongshitou += purpleObj[purples[i] - 1].cailiao[1];
        nowLevel.huangshitou += purpleObj[purples[i] - 1].cailiao[0];
        nowLevel.zuanshi += purpleObj[purples[i] - 1].zuanshi;
        nowLevel.zhanli += purpleObj[purples[i] - 1].zhanli;
        nowLevel.purple += 4352 - purpleObj[purples[i] - 1].count;
    }
    for (let i = 0; i < golds.length; i++) {
        goldLevel += golds[i];
        nowLevel.baishitou += goldObj[golds[i] - 1].cailiao[3];
        nowLevel.heishitou += goldObj[golds[i] - 1].cailiao[2];
        nowLevel.hongshitou += goldObj[golds[i] - 1].cailiao[1];
        nowLevel.huangshitou += goldObj[golds[i] - 1].cailiao[0];
        nowLevel.zuanshi += goldObj[golds[i] - 1].zuanshi;
        nowLevel.zhanli += goldObj[golds[i] - 1].zhanli;
        nowLevel.gold += 2720 - goldObj[golds[i] - 1].count;
    }
    blueCard.value = blues.length ? blueLevel / blues.length : 0;
    purpleCard.value = purples.length ? purpleLevel / purples.length : 0;
    orangeCard.value = golds.length ? goldLevel / golds.length : 0;
    const total = blues.length + purples.length + golds.length;
    allCard.value = total ? (blueLevel + purpleLevel + goldLevel) / total : 0;
    to24Level.baishitou =
        blues.length * blueObj[23].cailiao[3] +
        purples.length * purpleObj[23].cailiao[3] +
        golds.length * goldObj[23].cailiao[3];
    to24Level.heishitou =
        blues.length * blueObj[23].cailiao[2] +
        purples.length * purpleObj[23].cailiao[2] +
        golds.length * goldObj[23].cailiao[2];
    to24Level.hongshitou =
        blues.length * blueObj[23].cailiao[1] +
        purples.length * purpleObj[23].cailiao[1] +
        golds.length * goldObj[23].cailiao[1];
    to24Level.huangshitou =
        blues.length * blueObj[23].cailiao[0] +
        purples.length * purpleObj[23].cailiao[0] +
        golds.length * goldObj[23].cailiao[0];
    to24Level.zuanshi =
        blues.length * blueObj[23].zuanshi +
        purples.length * purpleObj[23].zuanshi +
        golds.length * goldObj[23].zuanshi;
    to24Level.zhanli =
        blues.length * blueObj[23].zhanli +
        purples.length * purpleObj[23].zhanli +
        golds.length * goldObj[23].zhanli;
}

function showCards(type: number) {
    visible.value = true;
    const map: Record<number, { title: string; list: any }> = {
        6: { title: "SSS级神卡展示", list: sssImgList },
        5: { title: "SS级强卡展示", list: ssImgList },
        4: { title: "S级卡牌展示", list: sImgList },
        3: { title: "A级卡牌展示", list: aImgList },
        2: { title: "B级弱卡展示", list: bImgList },
        1: { title: "C级弱卡展示", list: cImgList },
        0: { title: "D级弱卡展示", list: dImgList }
    };
    const conf = map[type] ?? map[0];
    title.value = conf.title;
    lajiCards.value = conf.list.value.map(mapCard);
}

const detailData = reactive({
    id: "",
    zhenyin: "",
    name: "",
    quality: "",
    cost: null as number | null,
    type: null as number | null,
    img: "",
    grade: "",
    data: [] as any[]
});

function showDetail(e: any) {
    visible2.value = true;
    detailData.id = e.id;
    detailData.zhenyin = e.zhenyin;
    detailData.name = e.name;
    detailData.quality = e.quality;
    detailData.cost = e.cost;
    detailData.type = e.type;
    detailData.img = e.img;
    detailData.grade = e.grade;
    detailData.data = e.data;
}

onMounted(async () => {
    const nowImg: any = heroTable.find((e: any) => e.id == ceshiData.hero.id)?.img;
    heroImg.value = import.meta.env.VITE_APP_BASE_URL + "heroImg" + nowImg;
    heroName.value = heroTable.find((e: any) => e.id == ceshiData.hero.id)?.name || "";
    nowLife.value = ceshiData.hero.life;
    await initCards();
    getList();
});
</script>

<style lang="less" scoped>
.main {
    padding: 4px 2px 8px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    padding: 12px;
    background: #f7f8fa;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
}

.head-meta {
    min-width: 0;
}

.title {
    margin: 0 0 6px;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.life {
    font-size: 13px;
    color: #6b7280;
}

.hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.hero-img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
}

.hero-name {
    font-size: 12px;
    color: #374151;
}

.card {
    width: 100%;
    border: 1px solid #e8ebf0;
    background: #fff;
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.bold {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #1f2937;
}

.card_body {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.flex_left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
}

.label {
    width: 30%;
    min-width: 72px;
    color: #6b7280;
}

.value {
    flex: 1;
    min-width: 0;
}

.pct {
    width: 70px;
    flex: none;
}

.count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.modal-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.modal-card {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    object-fit: cover;
    cursor: pointer;
}
</style>
