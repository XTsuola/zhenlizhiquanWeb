<template>
    <div class="detail" :class="qualityToneClass">
        <div class="detail-head">
            <h3 class="name">{{ prop.detailData.name }}</h3>
            <div class="level-actions">
                <a-button size="small" :disabled="nowlevel == 0" @click="nowlevel--">上一级</a-button>
                <a-button size="small" :disabled="nowlevel >= maxLevel" @click="nowlevel++">下一级</a-button>
            </div>
        </div>
        <div class="detail-body">
            <div class="row">
                <div class="label">主种族</div>
                <div class="value">{{ zhenyinList[prop.detailData.zhu - 1] || "-" }}</div>
            </div>
            <div class="row">
                <div class="label">副种族</div>
                <div class="value">{{ zhenyinList[prop.detailData.fu - 1] || "-" }}</div>
            </div>
            <div class="row">
                <div class="label">图片</div>
                <div class="value">
                    <div class="avatar-wrap">
                        <img class="avatar" :src="prop.detailData.img" :alt="prop.detailData.name" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">技能名称</div>
                <div class="value">
                    <span class="strong">{{ prop.detailData.skillName || "-" }}</span>
                </div>
            </div>
            <div class="row">
                <div class="label">技能等级</div>
                <div class="value">
                    <span class="strong">{{ nowlevel + 1 }}</span>
                </div>
            </div>
            <div class="row">
                <div class="label">效果描述</div>
                <div class="value">
                    <div class="effect">{{ currentEffect }}</div>
                </div>
            </div>
            <div class="row row--last">
                <div class="label">英雄品质</div>
                <div class="value">
                    <a-tag :color="getQualityColor(prop.detailData.quality)">
                        {{ getQualityName(prop.detailData.quality) }}
                    </a-tag>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { zhenyinList } from "@/utils/func";

const prop = defineProps<{
    detailData: any;
}>();

const nowlevel = ref(14);
const maxLevel = computed(() => {
    const len = prop.detailData?.data?.length || 0;
    return Math.max(len - 1, 0);
});

const currentEffect = computed(() => {
    const list = prop.detailData?.data;
    if (!list?.length) return "-";
    const item = list[Math.min(nowlevel.value, list.length - 1)];
    return item?.effect || "-";
});

const qualityToneClass = computed(() => {
    const q = Number(prop.detailData.quality);
    if (q === 4) return "tone-orange";
    if (q === 3) return "tone-purple";
    if (q === 2) return "tone-blue";
    if (q === 1) return "tone-white";
    return "";
});

const qualityColorList = [
    { label: "橙色", value: 4, color: "orange" },
    { label: "紫色", value: 3, color: "purple" },
    { label: "蓝色", value: 2, color: "blue" },
    { label: "白色", value: 1, color: "lightgray" }
];

function getQualityName(quality: number) {
    return qualityColorList.find((e) => e.value == quality)?.label || "-";
}

function getQualityColor(quality: number) {
    return qualityColorList.find((e) => e.value == quality)?.color || "#cccccc";
}

watch(
    () => prop.detailData?.name,
    () => {
        nowlevel.value = Math.min(14, maxLevel.value);
    },
    { immediate: true }
);
</script>

<style lang="less" scoped>
.detail {
    --accent: #5a8fc0;
    --line: color-mix(in srgb, var(--accent) 18%, #e8ebf0);
    --line-soft: color-mix(in srgb, var(--accent) 10%, #eef1f5);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent),
        0 2px 10px rgba(15, 23, 42, 0.04);
    border-left: 3px solid var(--accent);

    &.tone-white {
        --accent: #9ca3af;
    }

    &.tone-blue {
        --accent: #4f9bc4;
    }

    &.tone-purple {
        --accent: #8e488e;
    }

    &.tone-orange {
        --accent: #e67e22;
    }
}

.detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 14px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, #f8fafc), #f3f6f9 55%, #eef2f6);
    border-bottom: 1px solid var(--line);
}

.name {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
    word-break: break-all;
    min-width: 0;
    letter-spacing: 0.01em;
}

.level-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.row {
    display: grid;
    grid-template-columns: 84px 1fr;
    border-bottom: 1px solid var(--line-soft);
    min-height: 44px;
    transition: background 0.15s ease;

    &:hover {
        background: color-mix(in srgb, var(--accent) 4%, #fff);
    }

    &--last {
        border-bottom: none;
    }
}

.label {
    padding: 10px 12px;
    background: color-mix(in srgb, var(--accent) 6%, #fafbfc);
    border-right: 1px solid var(--line-soft);
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
}

.value {
    padding: 10px 12px;
    color: #1f2937;
    font-size: 13px;
    display: flex;
    align-items: center;
    min-width: 0;
    word-break: break-word;
}

.strong {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 15px;
    color: #1f2937;
}

.effect {
    width: 100%;
    line-height: 1.6;
    white-space: pre-wrap;
    padding: 8px 10px;
    border-radius: 8px;
    background: linear-gradient(180deg, #f8fafc, #f3f6f9);
    border: 1px solid var(--line-soft);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    color: #374151;
}

.avatar-wrap {
    padding: 2px;
    border-radius: 10px;
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--accent) 70%, #fff),
        #fff 42%,
        color-mix(in srgb, var(--accent) 45%, #dbe3ea)
    );
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent),
        0 2px 8px color-mix(in srgb, var(--accent) 18%, transparent);
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
    border: none;
    display: block;
    background: #fff;
}

@media (max-width: 420px) {
    .detail-head {
        flex-wrap: wrap;
    }

    .row {
        grid-template-columns: 72px 1fr;
    }

    .label,
    .value {
        padding: 9px 10px;
        font-size: 12px;
    }
}
</style>
