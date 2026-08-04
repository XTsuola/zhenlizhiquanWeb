<template>
    <div class="detail">
        <div class="detail-head">
            <h3 class="name">{{ prop.detailData.name }}</h3>
            <div class="level-actions">
                <a-button size="small" :disabled="nowlevel == 0" @click="nowlevel--">上一级</a-button>
                <a-button size="small" :disabled="nowlevel >= maxLevel" @click="nowlevel++">下一级</a-button>
            </div>
        </div>
        <div class="detail-body">
            <div class="row">
                <div class="label">种族</div>
                <div class="value">{{ zhenyinList[prop.detailData.zhenyin - 1] || "-" }}</div>
            </div>
            <div class="row">
                <div class="label">星级</div>
                <div class="value">{{ nowlevel + 1 }}</div>
            </div>
            <div class="row">
                <div class="label">图片</div>
                <div class="value">
                    <img class="avatar" :src="prop.detailData.img" :alt="prop.detailData.name" />
                </div>
            </div>
            <div class="row">
                <div class="label">效果描述</div>
                <div class="value effect">{{ currentEffect }}</div>
            </div>
            <div class="row">
                <div class="label">被动加成</div>
                <div class="value">{{ prop.detailData.bonus || "-" }}</div>
            </div>
            <div class="row">
                <div class="label">战力加成</div>
                <div class="value">{{ getZhanli(prop.detailData.quality) }}</div>
            </div>
            <div class="row">
                <div class="label">神器类型</div>
                <div class="value">{{ prop.detailData.type == 1 ? "武器" : "宝物" }}</div>
            </div>
            <div class="row row--last">
                <div class="label">神器品质</div>
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
import { blueList, purpleList, goldList } from "@/data/shenqiData/zhanli";

const prop = defineProps<{
    detailData: any;
}>();
const nowlevel = ref(14);
const maxLevel = computed(() => Math.max((prop.detailData?.data?.length || 1) - 1, 0));
const currentEffect = computed(() => {
    const list = prop.detailData?.data;
    if (!list?.length) return "-";
    return list[Math.min(nowlevel.value, list.length - 1)]?.effect || "-";
});

const qualityColorList = [
    { label: "橙色", value: 3, color: "#FFA500" },
    { label: "紫色", value: 2, color: "#8e488e" },
    { label: "蓝色", value: 1, color: "#2db7f5" }
];

function getZhanli(quality: number) {
    let zhanli = 0;
    if (quality == 1) zhanli = blueList[nowlevel.value]?.value || 0;
    else if (quality == 2) zhanli = purpleList[nowlevel.value]?.value || 0;
    else if (quality == 3) zhanli = goldList[nowlevel.value]?.value || 0;
    return zhanli > 10000 ? zhanli / 10000 + "万" : zhanli;
}

function getQualityName(quality: number) {
    return qualityColorList.find((e) => e.value == quality)?.label || "-";
}

function getQualityColor(quality: number) {
    return qualityColorList.find((e) => e.value == quality)?.color || "#cccccc";
}

watch(
    () => prop.detailData?.name,
    () => { nowlevel.value = Math.min(14, maxLevel.value); },
    { immediate: true }
);
</script>

<style lang="less" scoped>
.detail {
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
}

.detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #f7f8fa;
    border-bottom: 1px solid #e8ebf0;
}

.name {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.level-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.row {
    display: grid;
    grid-template-columns: 88px 1fr;
    border-bottom: 1px solid #eef1f5;

    &--last {
        border-bottom: none;
    }
}

.label {
    padding: 10px 12px;
    background: #fafbfc;
    border-right: 1px solid #eef1f5;
    color: #6b7280;
    font-size: 13px;
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

.effect {
    line-height: 1.55;
    white-space: pre-wrap;
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #e8ebf0;
    display: block;
}
</style>
