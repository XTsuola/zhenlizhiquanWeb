<template>
    <div class="page">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">英雄碎片</h1>
                <p class="subtitle">按品质查看升级 / 升星碎片需求</p>
            </div>
            <a-button @click="goBack">返回</a-button>
        </div>

        <a-spin :spinning="tableLoading">
            <div v-if="data.length" class="list">
                <div
                    v-for="item in sortedData"
                    :key="item.id"
                    class="card"
                    :class="`card--q${item.quality}`"
                >
                    <div class="card-head">
                        <span class="quality-dot" aria-hidden="true" />
                        <div class="card-meta">
                            <span class="quality-name">{{ qualityLabel(item.quality) }}</span>
                            <span class="quality-hint">{{ qualityHint(item.quality) }}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button type="button" class="action-btn" @click="showModal(1, item)">
                            <span class="action-label">升级</span>
                            <span class="action-desc">等级碎片</span>
                        </button>
                        <button type="button" class="action-btn" @click="showModal(2, item)">
                            <span class="action-label">升星</span>
                            <span class="action-desc">星级碎片</span>
                        </button>
                    </div>
                </div>
            </div>
            <a-empty v-else description="暂无数据" />
        </a-spin>

        <a-modal
            v-model:open="visible"
            destroyOnClose
            :title="levelTitle"
            :maskClosable="false"
            :width="isNarrow ? '94%' : 640"
            centered
        >
            <div class="modal-panel" :class="`modal-panel--q${detailData.quality}`">
                <a-table
                    :columns="columns2"
                    :data-source="detailData.levelData"
                    :pagination="false"
                    size="middle"
                    bordered
                    :scroll="{ x: 'max-content' }"
                    row-key="name"
                />
            </div>
            <template #footer>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>

        <a-modal
            v-model:open="visible2"
            destroyOnClose
            :title="starTitle"
            :maskClosable="false"
            :width="isNarrow ? '94%' : 560"
            centered
        >
            <div class="modal-panel" :class="`modal-panel--q${detailData.quality}`">
                <a-table
                    :columns="columns3"
                    :data-source="detailData.skillData"
                    :pagination="false"
                    size="middle"
                    bordered
                    :scroll="{ x: 'max-content' }"
                    row-key="name"
                />
            </div>
            <template #footer>
                <a-button @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { getShardList } from "@/api/hero";
import router from "@/router";

interface DetailDataType {
    id: number;
    quality: number;
    levelData: any[];
    skillData: any[];
}

const qualityList = ["白色英雄", "蓝色英雄", "紫色英雄", "橙色英雄"];
const qualityHints = ["基础品质", "精良品质", "史诗品质", "传说品质"];

const tableLoading = ref(false);
const data = ref<any[]>([]);
const visible = ref(false);
const visible2 = ref(false);
const levelTitle = ref("橙色英雄升级碎片需求");
const starTitle = ref("橙色英雄升星碎片需求");
const isNarrow = ref(window.innerWidth < 576);
const detailData = reactive<DetailDataType>({
    id: 0,
    quality: 0,
    levelData: [],
    skillData: []
});

const columns2 = [
    { title: "描述", dataIndex: "name", key: "name", ellipsis: true },
    { title: "碎片", dataIndex: "suipian", key: "suipian", width: 88, align: "right" },
    { title: "钻石", dataIndex: "zuanshi", key: "zuanshi", width: 88, align: "right" }
];
const columns3 = [
    { title: "描述", dataIndex: "name", key: "name", ellipsis: true },
    { title: "碎片", dataIndex: "suipian", key: "suipian", width: 88, align: "right" }
];

const sortedData = computed(() =>
    [...data.value].sort((a, b) => (b.quality || 0) - (a.quality || 0))
);

function qualityLabel(quality: number) {
    return qualityList[quality - 1] || "未知品质";
}

function qualityHint(quality: number) {
    return qualityHints[quality - 1] || "";
}

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function showModal(type: number, record: any) {
    detailData.id = record.id;
    detailData.quality = record.quality;
    if (type == 1) {
        visible.value = true;
        levelTitle.value = (qualityList[record.quality - 1] || "英雄") + "升级碎片需求";
        try {
            detailData.levelData = JSON.parse(record.levelData);
        } catch {
            detailData.levelData = [];
        }
    } else {
        visible2.value = true;
        starTitle.value = (qualityList[record.quality - 1] || "英雄") + "升星碎片需求";
        try {
            detailData.skillData = JSON.parse(record.skillData);
        } catch {
            detailData.skillData = [];
        }
    }
}

function goBack() {
    router.go(-1);
}

async function getOriginalData() {
    tableLoading.value = true;
    try {
        const res = await getShardList();
        if (res.status == 200) {
            data.value = res.data.data;
        }
    } finally {
        tableLoading.value = false;
    }
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getOriginalData();
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    min-width: 0;
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

.list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card {
    --accent: #94a3b8;
    --soft: #f1f5f9;

    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    border-left: 4px solid var(--accent);

    &--q1 {
        --accent: #9ca3af;
        --soft: #f3f4f6;
    }

    &--q2 {
        --accent: #4f9bc4;
        --soft: #eaf6fb;
    }

    &--q3 {
        --accent: #8e488e;
        --soft: #f8edf8;
    }

    &--q4 {
        --accent: #e67e22;
        --soft: #fff3e8;
    }
}

.card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px 8px;
}

.quality-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    flex-shrink: 0;
}

.card-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.quality-name {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
}

.quality-hint {
    font-size: 12px;
    color: #94a3b8;
}

.card-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 12px 12px;
}

.action-btn {
    appearance: none;
    border: 1px solid #e5e7eb;
    background: var(--soft);
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;

    &:hover {
        border-color: var(--accent);
        background: #fff;
    }

    &:active {
        transform: scale(0.98);
    }
}

.action-label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
}

.action-desc {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: #64748b;
}

.modal-panel {
    --accent: #94a3b8;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e8ebf0;
    border-top: 3px solid var(--accent);

    &--q1 {
        --accent: #9ca3af;
    }

    &--q2 {
        --accent: #4f9bc4;
    }

    &--q3 {
        --accent: #8e488e;
    }

    &--q4 {
        --accent: #e67e22;
    }

    :deep(.ant-table-thead > tr > th) {
        background: #f8fafc;
        font-weight: 600;
    }
}

/* color-mix 不支持时的兜底：圆点不加外环也没关系 */
@supports not (background: color-mix(in srgb, red 50%, blue)) {
    .quality-dot {
        box-shadow: none;
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 720px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .list {
        gap: 12px;
    }

    .card-head {
        padding: 14px 16px 10px;
    }

    .card-actions {
        padding: 0 14px 14px;
        gap: 10px;
    }

    .action-btn {
        padding: 12px 14px;
    }
}
</style>
