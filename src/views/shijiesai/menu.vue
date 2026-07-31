<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">世界赛</h1>
            <div class="actions">
                <a-button @click="goBack">返回首页</a-button>
            </div>
        </div>
        <div class="tools">
            <button
                v-for="(item, index) in seasons"
                :key="item.num"
                type="button"
                class="tool"
                :style="{ '--tool': TOOL_COLORS[index % TOOL_COLORS.length] }"
                @click="goList(item.num)"
            >
                {{ item.label }}
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from "@/router";

const TOOL_COLORS = ["#4f9bc4", "#45a8b0", "#5a8fc0", "#6a9bb0"];
const seasons = [7, 8, 9, 10, 11].map((num) => ({
    num,
    label: `第${num}届世界赛`
}));

function goBack() {
    router.push("/home");
}

function goList(num: number) {
    sessionStorage.setItem("gameType", String(num));
    router.push("/gameList");
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
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
    min-height: 52px;
    padding: 12px;
    background:
        linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(255, 255, 255, 0.06) 42%,
            rgba(0, 0, 0, 0.12) 100%
        ),
        var(--tool);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        0 1px 2px rgba(15, 23, 42, 0.08);
    transition: filter 0.15s ease, transform 0.15s ease;

    &:hover {
        filter: brightness(1.06);
    }

    &:active {
        filter: brightness(0.94);
        transform: scale(0.98);
    }
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 560px;
        margin: 0 auto;
    }

    .tools {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
