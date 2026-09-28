<template>
    <div class="board">
        <header class="board-head">
            <div class="head-main">
                <h1 class="title">开局英雄选择指南</h1>
                <p class="subtitle">真理之拳节奏榜 · 已评测 {{ reviewedCount }} / {{ heroes.length }}</p>
            </div>
            <div class="head-actions">
                <a-button size="small" type="primary" :loading="exporting" @click="exportImage">导出图片</a-button>
                <a-button size="small" type="primary" ghost @click="goReview">雷达评测</a-button>
                <a-button size="small" @click="goBack">返回</a-button>
            </div>
        </header>

        <a-spin :spinning="loading">
            <div v-if="groups.length" ref="exportRootRef" class="export-root" :class="{ 'is-exporting': exporting }">
                <div class="export-banner">
                    <div class="export-title">开局英雄选择指南</div>
                    <div class="export-sub">真理之拳节奏榜 · 1 白 / 2 蓝 / 3 紫 / 4 橙 / 5 红</div>
                </div>

                <div class="board-body">
                    <div class="groups">
                        <section v-for="group in groups" :key="group.id" class="race-block">
                            <div class="race-label" :style="{ '--race': group.color }">
                                <img v-if="group.icon" class="race-icon" :src="group.icon" :alt="group.name" />
                                <span>{{ group.name }}</span>
                            </div>
                            <div class="hero-grid">
                                <article
                                    v-for="item in group.items"
                                    :key="item.id"
                                    class="hero-card"
                                    :style="{ '--race': item.raceColor }"
                                >
                                    <div class="name-bar">{{ item.shortName }}</div>
                                    <div class="portrait">
                                        <img :src="item.img" :alt="item.name" />
                                        <span class="avg" :style="{ background: item.accent }">{{ item.avgText }}</span>
                                    </div>
                                    <div class="bars">
                                        <div v-for="axis in scoreAxes" :key="axis.key" class="bar-row">
                                            <span class="bar-label">{{ axis.short }}</span>
                                            <div class="chevrons" :style="{ '--tone': scoreTone(item[axis.key]) }">
                                                <i
                                                    v-for="n in 5"
                                                    :key="n"
                                                    class="chev"
                                                    :class="{ on: scoreValue(item[axis.key]) >= n }"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p v-if="item.reviewText" class="note">{{ item.reviewText }}</p>
                                </article>
                            </div>
                        </section>
                    </div>

                    <aside class="legend-panel">
                        <h2 class="legend-title">评分注释</h2>
                        <p class="legend-scale">1 白 · 2 蓝 · 3 紫 · 4 橙 · 5 红</p>
                        <div class="legend-list">
                            <div v-for="axis in scoreAxes" :key="axis.key" class="legend-item">
                                <strong>{{ axis.label }}</strong>
                                <span>{{ axis.hint }}</span>
                            </div>
                        </div>
                        <div class="legend-notes">
                            <p>头像角标为四维平均分（四舍五入）。</p>
                            <p>未填写维度按灰色空条显示，不计入平均分。</p>
                            <p>养成容易度：分数越高越容易养成。</p>
                        </div>
                    </aside>
                </div>
            </div>
            <a-empty v-else description="暂无英雄数据" />
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import { toBlob } from "html-to-image";
import { getHeroList } from "@/api/hero";
import {
    SCORE_COLORS,
    clampScore,
    hasManualReview,
    heroReviewMap,
    scoreColor,
    type HeroScore,
    type ReviewAxisKey
} from "@/data/heroData/review";
import router from "@/router";
import iconEmpire from "@/assets/zhongzu/simangdiguo.png";
import iconYinmi from "@/assets/zhongzu/yinmizhe.png";
import iconChanyi from "@/assets/zhongzu/chanyigu.png";
import iconHaigang from "@/assets/zhongzu/tiantanggang.png";
import iconLianyu from "@/assets/zhongzu/lianyushenyuan.png";
import iconManshi from "@/assets/zhongzu/manshikuangye.png";
import iconDongshen from "@/assets/zhongzu/dongshenshitu.png";

const tab = defineModel<string>("tab", { required: true });

type ScoreAxis = {
    key: Exclude<ReviewAxisKey, "sample">;
    label: string;
    short: string;
    hint: string;
};

const scoreAxes: ScoreAxis[] = [
    {
        key: "dungeon",
        label: "地城/战役",
        short: "地城",
        hint: "PVE 推进、战役与免费资源获取速度"
    },
    {
        key: "pvp",
        label: "PVP/世界赛",
        short: "PVP",
        hint: "天梯、异界、世界赛等对抗主流阵容的能力"
    },
    {
        key: "boss",
        label: "BOSS",
        short: "BOSS",
        hint: "日常 BOSS 输出与钻石收益贡献"
    },
    {
        key: "growth",
        label: "养成容易度",
        short: "养成",
        hint: "分数越高越容易养成，碎片与成型成本更低"
    }
];

const raceMeta = [
    { id: 1, name: "帝国", color: "#e69500", icon: iconEmpire },
    { id: 2, name: "隐秘", color: "#8a2be2", icon: iconYinmi },
    { id: 3, name: "禅意", color: "#2e8b57", icon: iconChanyi },
    { id: 4, name: "海港", color: "#1a6fa5", icon: iconHaigang },
    { id: 5, name: "炼狱", color: "#c01b10", icon: iconLianyu },
    { id: 6, name: "蛮石", color: "#8b5a2b", icon: iconManshi },
    { id: 7, name: "冬神", color: "#0290b5", icon: iconDongshen }
];

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "heroImg";
const loading = ref(false);
const exporting = ref(false);
const heroes = ref<any[]>([]);
const exportRootRef = ref<HTMLElement | null>(null);

const reviewedCount = computed(
    () => heroes.value.filter((item) => hasManualReview(heroReviewMap[item.id])).length
);

const groups = computed(() =>
    raceMeta
        .map((race) => {
            const items = heroes.value
                .filter((item) => item.zhu === race.id)
                .sort(
                    (a, b) =>
                        Number(b.reviewed) - Number(a.reviewed) ||
                        b.avg - a.avg ||
                        String(a.name).localeCompare(String(b.name), "zh")
                );
            return { ...race, items };
        })
        .filter((group) => group.items.length)
);

function shortName(name: string) {
    if (!name) return "";
    const parts = name.split("·");
    return parts[parts.length - 1] || name;
}

function scoreValue(score: number | null | undefined) {
    if (score == null) return 0;
    return clampScore(score);
}

function scoreTone(score: number | null | undefined) {
    if (score == null) return "#64748b";
    return SCORE_COLORS[clampScore(score)];
}

function goReview() {
    tab.value = "review";
}

function goBack() {
    router.go(-1);
}

function waitFrames(n = 2) {
    return new Promise<void>((resolve) => {
        const step = (left: number) => {
            if (left <= 0) {
                resolve();
                return;
            }
            requestAnimationFrame(() => step(left - 1));
        };
        step(n);
    });
}

function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

async function exportImage() {
    if (exporting.value || !exportRootRef.value) return;
    exporting.value = true;
    const hideLoading = message.loading("正在导出图片…", 0);
    try {
        await nextTick();
        await waitFrames(2);
        const el = exportRootRef.value;
        const width = Math.ceil(Math.max(el.scrollWidth, el.offsetWidth));
        const height = Math.ceil(Math.max(el.scrollHeight, el.offsetHeight));
        const pixelRatio = 2;
        const blob = await toBlob(el, {
            pixelRatio,
            backgroundColor: "#121820",
            cacheBust: true,
            skipAutoScale: true,
            width,
            height,
            canvasWidth: Math.round(width * pixelRatio),
            canvasHeight: Math.round(height * pixelRatio),
            style: {
                transform: "none",
                width: `${width}px`,
                height: `${height}px`
            }
        });
        if (!blob || blob.size < 1024) throw new Error("empty image");
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
        saveBlob(blob, `英雄节奏榜-${stamp}.png`);
        message.success("图片已导出");
    } catch (err) {
        console.error(err);
        message.error("导出失败，请稍后重试");
    } finally {
        hideLoading();
        exporting.value = false;
    }
}

async function load() {
    loading.value = true;
    try {
        const heroRes = await getHeroList();
        const list = heroRes.status == 200 ? heroRes.data.data || [] : [];
        heroes.value = list.map((item: any) => {
            const review = heroReviewMap[item.id];
            const dungeon = review?.dungeon ?? null;
            const pvp = review?.pvp ?? null;
            const boss = review?.boss ?? null;
            const growth = review?.growth ?? null;
            const scores = [dungeon, pvp, boss, growth].filter((n): n is HeroScore => n != null);
            const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;
            const race = raceMeta.find((r) => r.id === item.zhu);
            return {
                ...item,
                dungeon,
                pvp,
                boss,
                growth,
                reviewed: hasManualReview(review),
                reviewText: review?.text || "",
                avg,
                avgText: scores.length ? String(Math.round(avg)) : "-",
                accent: scores.length ? scoreColor(avg) : "#64748b",
                raceColor: race?.color || "#94a3b8",
                shortName: shortName(item.name),
                img: IMG_PREFIX + item.img
            };
        });
    } catch {
        heroes.value = [];
    } finally {
        loading.value = false;
    }
}

onMounted(load);
</script>

<style lang="less" scoped>
.board {
    min-height: 100%;
    padding: 10px;
    box-sizing: border-box;
    background:
        radial-gradient(ellipse at top, rgba(56, 95, 122, 0.35), transparent 55%),
        linear-gradient(180deg, #1b2430 0%, #121820 100%);
    color: #e8eef5;
    overflow-x: hidden;
}

.board-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
}

.title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #f0a35a;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
}

.subtitle {
    margin: 3px 0 0;
    font-size: 11px;
    color: #9fb0c3;
}

.head-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
}

.export-root {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.export-banner {
    display: none;
}

.export-root.is-exporting {
    padding: 12px;
    background: linear-gradient(180deg, #1b2430 0%, #121820 100%);
    border-radius: 8px;
}

.export-root.is-exporting .export-banner {
    display: block;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(232, 238, 245, 0.12);
}

.export-title {
    font-size: 18px;
    font-weight: 800;
    color: #f0a35a;
}

.export-sub {
    margin-top: 2px;
    font-size: 11px;
    color: #9fb0c3;
}

.board-body {
    display: grid;
    gap: 8px;
}

.race-block {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 6px;
    align-items: start;
}

.race-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding-top: 14px;
    color: var(--race);
    font-size: 10px;
    font-weight: 700;
}

.race-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.race-label span {
    writing-mode: vertical-rl;
    letter-spacing: 0.1em;
}

.hero-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 5px;
}

.hero-card {
    background: linear-gradient(180deg, #2a3442 0%, #1e2632 100%);
    border: 1px solid rgba(232, 238, 245, 0.08);
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.name-bar {
    background: var(--race);
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    line-height: 1.1;
    padding: 2px 1px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.portrait {
    position: relative;
    width: 72%;
    max-width: 56px;
    aspect-ratio: 1;
    margin: 3px auto 0;
    background: #111827;
    border-radius: 3px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.avg {
    position: absolute;
    left: 2px;
    bottom: 2px;
    min-width: 12px;
    height: 12px;
    padding: 0 3px;
    border-radius: 999px;
    color: #fff;
    font-size: 9px;
    font-weight: 800;
    line-height: 12px;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.bars {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 2px 3px 3px;
}

.bar-row {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr);
    align-items: center;
    gap: 3px;
}

.bar-label {
    font-size: 8px;
    color: #9fb0c3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chevrons {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    height: 5px;
}

.chev {
    display: block;
    height: 100%;
    background: rgba(148, 163, 184, 0.22);
    clip-path: polygon(0 0, 72% 0, 100% 50%, 72% 100%, 0 100%, 28% 50%);

    &.on {
        background: var(--tone);
    }
}

.note {
    margin: 0;
    padding: 0 2px 3px;
    font-size: 7px;
    line-height: 1.25;
    color: #cbd5e1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.legend-panel {
    background: rgba(17, 24, 39, 0.72);
    border: 1px solid rgba(232, 238, 245, 0.1);
    border-radius: 6px;
    padding: 10px;
}

.legend-title {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: #f0a35a;
}

.legend-scale {
    margin: 4px 0 8px;
    font-size: 12px;
    color: #9fb0c3;
}

.legend-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.legend-item {
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
        font-size: 13px;
        color: #e8eef5;
    }

    span {
        font-size: 12px;
        color: #9fb0c3;
        line-height: 1.4;
    }
}

.legend-notes {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed rgba(232, 238, 245, 0.12);

    p {
        margin: 0 0 5px;
        font-size: 12px;
        color: #cbd5e1;
        line-height: 1.45;

        &:last-child {
            margin-bottom: 0;
        }
    }
}

@media (min-width: 960px) {
    .board {
        padding: 14px 18px;
        max-width: 1280px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.35rem;
    }

    .board-body {
        grid-template-columns: minmax(0, 1fr) 200px;
        align-items: start;
        gap: 10px;
    }

    .race-block {
        grid-template-columns: 32px 1fr;
    }

    .race-icon {
        width: 20px;
        height: 20px;
    }

    .hero-grid {
        gap: 8px;
    }

    .name-bar {
        font-size: 11px;
        padding: 4px 2px;
    }

    .bar-row {
        grid-template-columns: 28px minmax(0, 1fr);
        gap: 4px;
    }

    .bar-label {
        font-size: 9px;
    }

    .chevrons {
        height: 7px;
    }

    .legend-panel {
        position: sticky;
        top: 10px;
    }
}
</style>
