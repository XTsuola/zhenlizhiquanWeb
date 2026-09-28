<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">英雄评测</h1>
                <p class="subtitle">
                    已评测 {{ reviewedCount }} / {{ originalData.length }} · 1 白 / 2 蓝 / 3 紫 / 4 橙 / 5 红
                </p>
            </div>
            <HeroTabs v-model="tab" />
            <div class="legend">
                <span v-for="n in scoreMarks" :key="n" class="legend-item" :style="{ '--tone': scoreColor(n) }">
                    {{ n }}{{ SCORE_LABELS[n] }}
                </span>
                <span class="legend-note">养成越高越容易 · 样本按卡组分享</span>
            </div>
            <div class="filter-bar">
                <div class="filters">
                    <a-input
                        v-model:value="formState.name"
                        allow-clear
                        placeholder="英雄名称"
                        class="field"
                        @pressEnter="search"
                    />
                </div>
                <div class="actions">
                    <a-button type="primary" @click="goOverview">统筹榜</a-button>
                    <a-button type="primary" :loading="tableLoading" @click="search">查询</a-button>
                    <a-button @click="reset">清空</a-button>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>

        <a-spin :spinning="tableLoading">
            <div v-if="data.length" class="list">
                <div
                    v-for="item in data"
                    :key="item.id"
                    class="card"
                    :style="{ '--accent': item.accent }"
                    :title="item.name"
                    role="button"
                    tabindex="0"
                    @click="showModal(item)"
                    @keydown.enter.prevent="showModal(item)"
                >
                    <img class="avatar" :src="item.img" :alt="item.name" />
                    <HeroRadar
                        compact
                        :dungeon="item.dungeon"
                        :pvp="item.pvp"
                        :boss="item.boss"
                        :growth="item.growth"
                        :sample="item.sample"
                        :sample-count="item.cardsCount"
                    />
                </div>
            </div>
            <a-empty v-else description="暂无匹配英雄" />
        </a-spin>

        <a-modal
            v-model:open="visible"
            destroyOnClose
            title="详细信息"
            :maskClosable="false"
            :width="isNarrow ? '92%' : 520"
            centered
        >
            <Detail v-if="visible" :detailData="detailData" />
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from "vue";
import { getHeroList } from "@/api/hero";
import { getFrequencyCardsAll } from "@/api/frequency";
import {
    SCORE_LABELS,
    heroReviewMap,
    hasManualReview,
    sampleScoreFromCounts,
    scoreColor,
    type HeroScore
} from "@/data/heroData/review";
import router from "@/router";
import HeroTabs from "./heroTabs.vue";
import HeroRadar from "./heroRadar.vue";

const tab = defineModel<string>("tab", { required: true });
const Detail = defineAsyncComponent(() => import("../model/detailHero.vue"));
const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const scoreMarks: HeroScore[] = [1, 2, 3, 4, 5];

const tableLoading = ref(false);
const originalData = ref<any[]>([]);
const cardsData = ref<any[]>([]);
const formState = reactive({ name: "" });
const data = ref<any[]>([]);
const visible = ref(false);
const isNarrow = ref(window.innerWidth < 576);
const detailData = reactive({
    name: "",
    quality: "",
    zhu: "",
    fu: "",
    skillName: "",
    img: "",
    data: [] as any[]
});

const reviewedCount = computed(
    () => originalData.value.filter((item) => hasManualReview(heroReviewMap[item.id])).length
);

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function applyFilter() {
    const name = formState.name.trim();
    const counts = originalData.value.map(
        (item) => cardsData.value.filter((e: any) => e.heroId == item.id).length
    );
    data.value = originalData.value
        .map((item, index) => {
            const review = heroReviewMap[item.id];
            const cardsCount = counts[index] || 0;
            const sample = sampleScoreFromCounts(cardsCount, counts);
            const scores = [review?.dungeon, review?.pvp, review?.boss, review?.growth, sample].filter(
                (n): n is HeroScore => n != null
            );
            const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 1;
            return {
                ...item,
                dungeon: review?.dungeon ?? null,
                pvp: review?.pvp ?? null,
                boss: review?.boss ?? null,
                growth: review?.growth ?? null,
                sample,
                cardsCount,
                reviewed: hasManualReview(review),
                avg,
                accent: hasManualReview(review) ? scoreColor(avg) : "#94a3b8",
                img: IMG_PREFIX + item.img
            };
        })
        .filter((item) => !name || item.name.includes(name))
        .sort(
            (a, b) =>
                Number(b.reviewed) - Number(a.reviewed) ||
                b.avg - a.avg ||
                b.cardsCount - a.cardsCount ||
                (b.quality || 0) - (a.quality || 0) ||
                String(a.name).localeCompare(String(b.name), "zh")
        );
}

function search() {
    applyFilter();
}

function reset() {
    formState.name = "";
    applyFilter();
}

function goOverview() {
    tab.value = "overview";
}

function goBack() {
    router.go(-1);
}

function showModal(record: any) {
    detailData.name = record.name;
    detailData.quality = record.quality;
    detailData.zhu = record.zhu;
    detailData.fu = record.fu;
    detailData.skillName = record.skillName;
    detailData.img = record.img;
    detailData.data = record.data;
    visible.value = true;
}

async function load() {
    tableLoading.value = true;
    try {
        const [heroRes, cardsRes] = await Promise.all([getHeroList(), getFrequencyCardsAll()]);
        if (heroRes.status == 200) {
            originalData.value = heroRes.data.data || [];
        }
        if (cardsRes.data.code == 200) {
            cardsData.value = cardsRes.data.data || [];
        }
        applyFilter();
    } catch {
        originalData.value = [];
        data.value = [];
    } finally {
        tableLoading.value = false;
    }
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    load();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
    overflow-x: hidden;
}

.toolbar {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    margin-bottom: 10px;
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
}

.legend-item {
    padding: 0 7px;
    height: 20px;
    border-radius: 4px;
    background: #f8fafc;
    color: var(--tone);
    font-size: 11px;
    font-weight: 700;
    line-height: 20px;
    border: 1px solid color-mix(in srgb, var(--tone) 35%, #e8ebf0);
}

.legend-note {
    font-size: 11px;
    color: #94a3b8;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.filters {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    flex: 1 1 220px;
    min-width: 0;
}

.field {
    flex: 1 1 0;
    min-width: 0;
    width: auto;
}

.actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    flex-shrink: 0;
}

.list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.card {
    --accent: #94a3b8;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin: 0;
    padding: 8px 4px 4px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-top: 3px solid var(--accent);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    text-align: center;

    &:hover {
        border-color: color-mix(in srgb, var(--accent) 45%, #e8ebf0);
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
    }
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    object-fit: cover;
    display: block;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #f3f4f6;
    flex-shrink: 0;
}

@media (min-width: 640px) {
    .list {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 900px) {
    .page {
        padding: 16px 20px;
        max-width: 1080px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .list {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
    }

    .card {
        padding: 10px 6px 6px;
    }

    .avatar {
        width: 44px;
        height: 44px;
    }
}
</style>
