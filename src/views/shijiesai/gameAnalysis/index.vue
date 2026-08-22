<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">比赛分析</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="tools">
            <button v-for="(item, index) in menuItems" :key="item.index" type="button" class="tool"
                :style="{ '--tool': TOOL_COLORS[index % TOOL_COLORS.length] }" @click="goIndex(item.index)">
                {{ item.label }}
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import router from "@/router";

const TOOL_COLORS = ["#4f9bc4", "#45a8b0", "#5a8fc0", "#6a9bb0"];
const gameType = sessionStorage.getItem("gameType");

const menuItems = computed(() => {
    const items = [
        { label: "所有比赛", index: 0 },
        { label: "8强比赛", index: 8 },
        { label: "4强至决赛", index: 4 },
        { label: "选手与击杀", index: 1 },
        { label: "种族选取表", index: 3 },
        { label: "种族胜率表", index: 5 }
    ];
    if (parseInt(gameType as string) - 7 > 0) {
        items.push({ label: "上届种族对比", index: 2 });
    }
    return items;
});

function goIndex(index: number) {
    if (index == 0) {
        router.push("/gameAnalysis/listAll");
    } else if (index == 2) {
        router.push("/gameAnalysis/gameCompare");
    } else if (index == 8) {
        router.push("/gameAnalysis/list8");
    } else if (index == 4) {
        router.push("/gameAnalysis/list4");
    } else if (index == 1) {
        router.push("/gameAnalysis/heroList");
    } else if (index == 3) {
        router.push("/gameAnalysis/zhongzuList");
    } else if (index == 5) {
        router.push("/gameAnalysis/zhongzuWR");
    }
}

function goBack() {
    router.go(-1);
}
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
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.tools {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.tool {
    appearance: none;
    border: none;
    border-radius: 10px;
    min-height: 56px;
    padding: 12px;
    background:
        linear-gradient(145deg,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(255, 255, 255, 0.06) 42%,
            rgba(0, 0, 0, 0.12) 100%),
        var(--tool);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: keep-all;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        0 1px 2px rgba(15, 23, 42, 0.08);
    transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        filter: brightness(1.06);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            0 2px 6px rgba(15, 23, 42, 0.12);
    }

    &:active {
        filter: brightness(0.94);
        transform: scale(0.98);
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .tools {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
    }

    .tool {
        font-size: 1.05rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .tool {
        transition: none;
    }
}
</style>
