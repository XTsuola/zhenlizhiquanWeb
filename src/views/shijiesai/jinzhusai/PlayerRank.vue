<template>
    <div class="page">
        <header class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">金主赛 · 选手排名</h1>
                <p class="subtitle">按本届最终名次排列 · 冠亚季殿单独排名，同轮其余按战力</p>
            </div>
            <div class="toolbar-actions">
                <a-button size="small" :loading="exporting" @click="exportRank">导出图片</a-button>
                <a-button size="small" @click="goBack">返回晋级图</a-button>
            </div>
        </header>

        <div ref="exportRootRef" class="export-root" :class="{ 'is-exporting': exporting }">
            <div v-if="exporting" class="export-banner">金主赛 · 选手排名</div>
            <div class="table-wrap">
            <table class="rank-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>选手</th>
                        <th>标签</th>
                        <th>名次</th>
                        <th>签位</th>
                        <th>战力</th>
                        <th>英雄顺位</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in rows"
                        :key="row.id"
                        class="clickable"
                        :class="{
                            top1: row.rank === 1,
                            top2: row.rank === 2,
                            top3: row.rank === 3,
                            'over-yi': row.zhanli >= 1
                        }"
                        @click="openPlayer(row.id)"
                    >
                        <td class="num rank">{{ row.rank }}</td>
                        <td class="name">{{ row.name }}</td>
                        <td class="tags-cell">
                            <span v-if="row.tags.length" class="tags">
                                <span
                                    v-for="tag in row.tags"
                                    :key="row.id + '-' + String(tag.id)"
                                    class="player-tag"
                                    :class="{ 'tag-rainbow': tag.id === 'tianlong', 'tag-rainbow-dawei': tag.id === 'dawei' }"
                                    :style="tag.id === 'tianlong' || tag.id === 'dawei' ? undefined : { color: '#fff', background: tag.color, borderColor: tag.color }"
                                >{{ tag.label }}</span>
                            </span>
                            <span v-else class="tags-empty">—</span>
                        </td>
                        <td>
                            <span class="stand" :class="'stand-' + row.standing">{{ row.standing }}</span>
                        </td>
                        <td class="num">{{ row.id }}</td>
                        <td class="num power">{{ row.zhanli.toFixed(2) }}</td>
                        <td>
                            <span class="heroes">
                                <span v-for="(hid, hi) in row.heroList" :key="row.id + '-' + hi" class="hero-chip">
                                    <HeroIcon :hid="hid" />
                                    <span class="hero-name">{{ hi + 1 }}.{{ getHeroName(hid) }}</span>
                                </span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <PlayerDetail v-model:open="detailOpen" :player-id="detailPlayerId" />
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from "vue";
import { message } from "ant-design-vue";
import { toBlob } from "html-to-image";
import router from "@/router";
import { calcPlayerRankTable, getHeroName } from "./players";
import HeroIcon from "./HeroIcon.vue";
import PlayerDetail from "./PlayerDetail.vue";

const rows = computed(() => calcPlayerRankTable());
const detailOpen = ref(false);
const detailPlayerId = ref<number | null>(null);
const exporting = ref(false);
const exportRootRef = ref<HTMLElement | null>(null);

function openPlayer(id: number) {
    detailPlayerId.value = id;
    detailOpen.value = true;
}

function goBack() {
    router.push({ name: "jinzhusai" });
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

async function renderRankBlob(pixelRatio: number) {
    const el = exportRootRef.value;
    if (!el) throw new Error("rank table missing");
    const width = Math.ceil(Math.max(el.scrollWidth, el.offsetWidth));
    const height = Math.ceil(Math.max(el.scrollHeight, el.offsetHeight));
    const blob = await toBlob(el, {
        pixelRatio,
        backgroundColor: "#ffffff",
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
    return blob;
}

async function exportRank() {
    if (exporting.value) return;
    exporting.value = true;
    const hideLoading = message.loading("正在生成排名图…", 0);
    try {
        await nextTick();
        if (document.fonts?.ready) await document.fonts.ready;
        await waitFrames(2);
        const ratios = [2, 1.5, 1];
        let blob: Blob | null = null;
        let lastError: unknown = null;
        for (const ratio of ratios) {
            try {
                blob = await renderRankBlob(ratio);
                break;
            } catch (err) {
                lastError = err;
            }
        }
        if (!blob) throw lastError || new Error("export failed");
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
        saveBlob(blob, `金主赛-选手排名-${stamp}.png`);
        message.success("排名图已导出");
    } catch (err) {
        console.error(err);
        message.error("导出失败，请稍后重试");
    } finally {
        hideLoading();
        exporting.value = false;
    }
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100dvh;
    min-height: 100svh;
    padding: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    background: #f3f4f6;
    color: #1f2937;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
}

.toolbar-text {
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #111827;
    line-height: 1.3;
}

.subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.35;
}

.toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
}

.export-root {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.export-banner {
    padding: 12px 14px 4px;
    font-size: 20px;
    font-weight: 800;
    color: #111827;
    background: #fff;
}

.table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    -webkit-overflow-scrolling: touch;
}

.export-root.is-exporting {
    flex: none;
    min-height: auto;
}

.export-root.is-exporting .table-wrap {
    flex: none;
    overflow: visible;
    border-radius: 0;
    border: none;
}

.export-root.is-exporting .hero-name {
    display: inline;
}

.rank-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.rank-table th,
.rank-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #eef2f6;
    white-space: nowrap;
}

.rank-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    font-weight: 800;
    color: #334155;
}

.rank-table .num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
}

.rank-table .rank {
    font-weight: 800;
    color: #0f172a;
}

.rank-table .name {
    font-weight: 800;
    color: #111827;
}

.rank-table .power {
    color: #b45309;
}

.rank-table tr.clickable {
    cursor: pointer;
}

.rank-table tr.clickable:hover {
    background: #f8fafc;
}

.rank-table tr.top1 {
    background: #fffbeb;
}

.rank-table tr.top2 {
    background: #f8fafc;
}

.rank-table tr.top3 {
    background: #fff7ed;
}

.rank-table tr.top1 .rank,
.rank-table tr.top1 .name {
    color: #b45309;
}

.rank-table tr.over-yi .power {
    color: #ca8a04;
}

.tags-cell {
    white-space: normal;
}

.tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tags-empty {
    color: #94a3b8;
}

.player-tag {
    display: inline-flex;
    align-items: center;
    padding: 1px 7px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.4;
    white-space: nowrap;
}

.tag-rainbow {
    position: relative;
    overflow: hidden;
    color: #5c3d0a;
    border: 1px solid #e0b84a;
    background: linear-gradient(135deg, #fff4c8 0%, #f0d078 45%, #e8b84a 100%);

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -40%;
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
        animation: shineSweep 2.4s ease-in-out infinite;
    }
}

.tag-rainbow-dawei {
    position: relative;
    overflow: hidden;
    color: #fff;
    border: 1px solid #c4b5fd;
    background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 28%, #a855f7 62%, #7c3aed 100%);
    text-shadow: 0 1px 1px rgba(76, 29, 149, 0.45);

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -40%;
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
        animation: shineSweep 1.8s ease-in-out infinite;
    }
}

@keyframes shineSweep {
    0% {
        left: -40%;
    }
    60%,
    100% {
        left: 120%;
    }
}

.stand {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
}

.stand-冠军 {
    background: #fef3c7;
    color: #92400e;
}

.stand-亚军 {
    background: #e2e8f0;
    color: #334155;
}

.stand-季军 {
    background: #ffedd5;
    color: #9a3412;
}

.stand-殿军 {
    background: #f1f5f9;
    color: #475569;
}

.heroes {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
}

.hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        gap: 10px;
    }

    .toolbar {
        padding: 12px 14px;
    }

    .title {
        font-size: 1.25rem;
    }

    .rank-table {
        font-size: 14px;
    }
}

@media (max-width: 767px) {
    .hero-name {
        display: none;
    }

    .export-root.is-exporting .hero-name {
        display: inline;
    }
}
</style>
