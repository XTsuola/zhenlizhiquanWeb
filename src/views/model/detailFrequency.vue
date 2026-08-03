<template>
    <div class="main">
        <div class="head">
            <div class="head-meta">
                <h3 class="title">{{ ceshiData.qu }}区 · {{ ceshiData.name }}</h3>
                <div class="life">
                    <span>当前生命 {{ nowLife }}</span>
                    <span class="life-sep">·</span>
                    <span>距满命 {{ maxLfie - nowLife }}</span>
                </div>
            </div>
            <div class="hero">
                <img class="hero-img" :src="heroImg" :alt="heroName" />
                <span class="hero-name">{{ heroName }}</span>
            </div>
        </div>

        <section class="block">
            <h4 class="block-title">卡等分析</h4>
            <div class="stat-grid">
                <div class="stat" style="--c: #4f9bc4">
                    <div class="stat-label">蓝卡等级</div>
                    <div class="stat-value">{{ blueCard.toFixed(2) }}</div>
                    <div class="stat-sub">级 · {{ blueList.length }}张 · {{ pct(blueList.length) }}</div>
                </div>
                <div class="stat" style="--c: #8e488e">
                    <div class="stat-label">紫卡等级</div>
                    <div class="stat-value">{{ purpleCard.toFixed(2) }}</div>
                    <div class="stat-sub">级 · {{ purpleList.length }}张 · {{ pct(purpleList.length) }}</div>
                </div>
                <div class="stat" style="--c: #e67e22">
                    <div class="stat-label">橙卡等级</div>
                    <div class="stat-value">{{ orangeCard.toFixed(2) }}</div>
                    <div class="stat-sub">级 · {{ goldList.length }}张 · {{ pct(goldList.length) }}</div>
                </div>
                <div class="stat" style="--c: #5a8fc0">
                    <div class="stat-label">平均等级</div>
                    <div class="stat-value">{{ allCard.toFixed(2) }}</div>
                    <div class="stat-sub">级 · 全卡组</div>
                </div>
            </div>
        </section>

        <section class="block">
            <h4 class="block-title">到 24 级还需资源</h4>
            <div class="need-grid">
                <div class="need" v-for="item in needRows" :key="item.label">
                    <div class="need-label" :style="item.color ? { color: item.color } : undefined">
                        {{ item.label }}
                    </div>
                    <div class="need-value">{{ item.value }}</div>
                </div>
            </div>
        </section>

        <section class="block">
            <h4 class="block-title">强卡占比</h4>
            <div class="grade-list">
                <div class="grade-row" v-for="item in gradeRows" :key="item.key">
                    <div class="grade-left">
                        <span class="grade-tag" :style="{ background: item.color }">{{ item.label }}</span>
                        <div class="grade-bar">
                            <div class="grade-fill" :style="{ width: `${(item.count / 30) * 100}%`, background: item.color }" />
                        </div>
                    </div>
                    <div class="grade-right">
                        <span class="grade-pct">{{ pct(item.count) }}</span>
                        <span class="grade-count">{{ item.count }}张</span>
                        <a-button v-if="item.count > 0" size="small" @click="showCards(item.type)">
                            {{ item.btn }}
                        </a-button>
                    </div>
                </div>
            </div>
        </section>

        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false" :width="isNarrow ? '94%' : 420" centered>
            <div class="modal-cards">
                <img
                    v-for="(obj, idx) in lajiCards"
                    :key="idx"
                    class="modal-card"
                    :src="obj.img"
                    :alt="obj.name"
                    @click="showDetail(obj)"
                />
            </div>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose title="详细信息" :maskClosable="false" :width="isNarrow ? '94%' : 420" centered>
            <Detail :detailData="detailData" />
            <template #footer>
                <a-button @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
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
const isNarrow = ref(window.innerWidth < 576);
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
    { key: "sss", label: "SSS", count: sss.value, type: 6, btn: "查看", color: "#e6b325" },
    { key: "ss", label: "SS", count: ss.value, type: 5, btn: "查看", color: "#000000" },
    { key: "s", label: "S", count: s.value, type: 4, btn: "查看", color: "#ff0000" },
    { key: "a", label: "A", count: a.value, type: 3, btn: "查看", color: "#ff6633" },
    { key: "b", label: "B", count: b.value, type: 2, btn: "查看", color: "#8e488e" },
    { key: "c", label: "C", count: c.value, type: 1, btn: "查弱", color: "#2db7f5" },
    { key: "d", label: "D", count: d.value, type: 0, btn: "查弱", color: "#87d068" }
]);

const needRows = computed(() => [
    { label: "蓝卡", value: `${nowLevel.blue} 张`, color: "#4f9bc4" },
    { label: "紫卡", value: `${nowLevel.purple} 张`, color: "#8e488e" },
    { label: "橙卡", value: `${nowLevel.gold} 张`, color: "#e67e22" },
    { label: "黄石头", value: formatRes(to24Level.huangshitou - nowLevel.huangshitou), color: "#ca8a04" },
    { label: "红石头", value: formatRes(to24Level.hongshitou - nowLevel.hongshitou), color: "#dc2626" },
    { label: "黑石头", value: formatRes(to24Level.heishitou - nowLevel.heishitou), color: "#374151" },
    { label: "白石头", value: formatRes(to24Level.baishitou - nowLevel.baishitou), color: "#6b7280" },
    { label: "钻石", value: formatRes(to24Level.zuanshi - nowLevel.zuanshi), color: "#45a8b0" }
]);

function pct(count: number) {
    return `${((count / 30) * 100).toFixed(1)}%`;
}

function formatRes(n: number) {
    return n > 10000 ? (n / 10000).toFixed(2) + " 万" : String(n);
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
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
    onResize();
    window.addEventListener("resize", onResize);
    const nowImg: any = heroTable.find((e: any) => e.id == ceshiData.hero.id)?.img;
    heroImg.value = import.meta.env.VITE_APP_BASE_URL + "heroImg" + nowImg;
    heroName.value = heroTable.find((e: any) => e.id == ceshiData.hero.id)?.name || "";
    nowLife.value = ceshiData.hero.life;
    await initCards();
    getList();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
});
</script>

<style lang="less" scoped>
.main {
    padding: 8px 0 4px;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    padding: 12px;
    background: #f7f8fa;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
}

.head-meta {
    min-width: 0;
}

.title {
    margin: 0 0 4px;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    word-break: break-all;
}

.life {
    font-size: 12px;
    color: #6b7280;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.life-sep {
    color: #d1d5db;
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

.block {
    margin-bottom: 10px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.block-title {
    margin: 0 0 10px;
    font-size: 0.92rem;
    font-weight: 700;
    color: #1f2937;
}

.stat-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.stat {
    --c: #5a8fc0;
    padding: 10px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--c) 10%, #fff);
    border-left: 3px solid var(--c);
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--c);
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
}

.stat-sub {
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
}

.need-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.need {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #eef1f5;
}

.need-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
    flex-shrink: 0;
}

.need-value {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
    font-variant-numeric: tabular-nums;
    text-align: right;
    min-width: 0;
    word-break: break-all;
}

.grade-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.grade-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.grade-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
}

.grade-tag {
    width: 40px;
    height: 22px;
    border-radius: 4px;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.grade-bar {
    flex: 1;
    min-width: 48px;
    height: 6px;
    border-radius: 999px;
    background: #eef1f5;
    overflow: hidden;
}

.grade-fill {
    height: 100%;
    border-radius: 999px;
    min-width: 0;
}

.grade-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.grade-pct {
    width: 44px;
    text-align: right;
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    font-variant-numeric: tabular-nums;
}

.grade-count {
    width: 36px;
    text-align: right;
    font-size: 12px;
    color: #9ca3af;
}

.modal-cards {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
}

.modal-card {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    object-fit: cover;
    cursor: pointer;
    display: block;
}

@media (min-width: 768px) {
    .stat-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .need-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .modal-cards {
        grid-template-columns: repeat(8, 1fr);
    }
}
</style>
