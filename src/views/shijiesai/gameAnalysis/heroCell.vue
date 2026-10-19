<template>
    <span class="hero-cell">
        <img class="avatar" :src="img" :alt="name" />
        <span class="text">
            <span class="name">{{ name }}</span>
            <span class="tags">
                <span class="tag" :style="{ '--tone': zhuRace.color }">{{ zhuRace.name }}</span>
                <span class="tag" :style="{ '--tone': fuRace.color }">{{ fuRace.name }}</span>
            </span>
        </span>
    </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
    name: string;
    img: string;
    zhu?: number;
    fu?: number;
}>();

const RACES = [
    { id: 1, name: "帝国", color: "#e69500" },
    { id: 2, name: "隐秘", color: "#8a2be2" },
    { id: 3, name: "禅意", color: "#2e8b57" },
    { id: 4, name: "海港", color: "#1a6fa5" },
    { id: 5, name: "炼狱", color: "#c01b10" },
    { id: 6, name: "蛮石", color: "#8b5a2b" },
    { id: 7, name: "冬神", color: "#0290b5" }
];

function raceOf(id?: number) {
    return RACES.find((r) => r.id === id) || { id: 0, name: "未知", color: "#94a3b8" };
}

const zhuRace = computed(() => raceOf(props.zhu));
const fuRace = computed(() => raceOf(props.fu));
</script>

<style lang="less" scoped>
.hero-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    white-space: normal;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: #e2e8f0;
    border: 1px solid rgba(15, 23, 42, 0.08);
}

.text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.name {
    font-weight: 800;
    color: #111827;
    line-height: 1.2;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tag {
    display: inline-flex;
    align-items: center;
    height: 16px;
    padding: 0 5px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    line-height: 16px;
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 12%, #fff);
    border: 1px solid color-mix(in srgb, var(--tone) 35%, #e8ebf0);
}
</style>
