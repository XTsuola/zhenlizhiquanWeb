<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">实用工具</h1>
            <div class="actions">
                <a-button @click="goHome">返回首页</a-button>
            </div>
        </div>

        <div class="tools">
            <button v-for="(item, index) in tools" :key="item.path" type="button" class="tool"
                :style="{ '--tool': TOOL_COLORS[index % TOOL_COLORS.length] }" @click="goUrl(item.path)">
                {{ item.label }}
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from "@/router";

/** 与首页 tools 共用同一套色板 */
const TOOL_COLORS = ["#4f9bc4", "#45a8b0", "#5a8fc0", "#6a9bb0"];
const tools = [
    { label: "英雄消耗", path: "/heroZuanshiTools" },
    { label: "神器计算", path: "/shenqiTools" },
    { label: "钻石收入", path: "/zuanshishouruTools" }
];

function goUrl(path: string) {
    router.push(path);
}

function goHome() {
    router.push("/home");
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
        max-width: 560px;
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
