<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">升卡 / 资源参考</h1>
            <div class="actions">
                <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
                    <a-radio-button value="now">本级</a-radio-button>
                    <a-radio-button value="sum">累计</a-radio-button>
                </a-radio-group>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="legend-hint">
            {{
                viewMode === "sum"
                    ? "累计 = 升到该级总共需要"
                    : "本级 = 升到该级新增消耗"
            }}
        </div>

        <div
            v-for="q in qualityTables"
            :key="q.key"
            class="section"
            :style="{ '--q': q.color }"
        >
            <h2 class="section-title">
                <span class="dot" />
                {{ q.label }} · {{ viewMode === "sum" ? "累计" : "本级" }}资源
            </h2>
            <div class="table-wrap">
                <table class="cost-table">
                    <thead>
                        <tr>
                            <th>等级</th>
                            <th>卡牌</th>
                            <th>钻石</th>
                            <th>黄石</th>
                            <th>红石</th>
                            <th>黑石</th>
                            <th>白石</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in q.rows" :key="row.level">
                            <td class="level">{{ row.level }}</td>
                            <td>{{ formatNum(pick(row, "count")) }}</td>
                            <td>{{ formatNum(pick(row, "zuanshi")) }}</td>
                            <td>{{ formatNum(pick(row, "huang")) }}</td>
                            <td>{{ formatNum(pick(row, "hong")) }}</td>
                            <td>{{ formatNum(pick(row, "hei")) }}</td>
                            <td>{{ formatNum(pick(row, "bai")) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-for="item in sections" :key="item.title" class="section">
            <h2 class="section-title plain">{{ item.title }}</h2>
            <button type="button" class="img-btn" @click="openImage(item.src)">
                <img :src="item.src" :alt="item.title" loading="lazy" />
            </button>
            <div class="hint">点击图片可查看大图</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { blueObj, purpleObj, goldObj } from "@/data/z_otherData/cailiao";
import router from "@/router";
import cardNeed from "@/assets/yiji/card_need.jpg";
import shenqiShengji from "@/assets/yiji/shenqishengji.jpg";
import moheDuihuan from "@/assets/yiji/moheduihuan.jpg";
import ziyuanBiao from "@/assets/yiji/ziyuanbiao.jpg";

type ViewMode = "now" | "sum";
type LevelRow = {
    level: number;
    zuanshi: number;
    count: number;
    cailiao: number[];
};
type CostRow = {
    level: number;
    zuanshiNow: number;
    zuanshiSum: number;
    countNow: number;
    countSum: number;
    huangNow: number;
    huangSum: number;
    hongNow: number;
    hongSum: number;
    heiNow: number;
    heiSum: number;
    baiNow: number;
    baiSum: number;
};

const viewMode = ref<ViewMode>("sum");

const QUALITIES = [
    { key: "blue", label: "蓝卡", color: "#4f9bc4", list: blueObj as LevelRow[] },
    { key: "purple", label: "紫卡", color: "#8e488e", list: purpleObj as LevelRow[] },
    { key: "gold", label: "橙卡", color: "#e67e22", list: goldObj as LevelRow[] }
] as const;

const sections = [
    { title: "升卡资源图", src: cardNeed },
    { title: "神器升级资源图", src: shenqiShengji },
    { title: "魔盒兑换表", src: moheDuihuan },
    { title: "资源估值表", src: ziyuanBiao }
];

function toRows(list: LevelRow[]): CostRow[] {
    return list.map((item, i) => {
        const prev = i === 0 ? null : list[i - 1];
        return {
            level: item.level,
            zuanshiNow: item.zuanshi - (prev?.zuanshi ?? 0),
            zuanshiSum: item.zuanshi,
            countNow: item.count - (prev?.count ?? 0),
            countSum: item.count,
            huangNow: item.cailiao[0] - (prev?.cailiao[0] ?? 0),
            huangSum: item.cailiao[0],
            hongNow: item.cailiao[1] - (prev?.cailiao[1] ?? 0),
            hongSum: item.cailiao[1],
            heiNow: item.cailiao[2] - (prev?.cailiao[2] ?? 0),
            heiSum: item.cailiao[2],
            baiNow: item.cailiao[3] - (prev?.cailiao[3] ?? 0),
            baiSum: item.cailiao[3]
        };
    });
}

const qualityTables = computed(() =>
    QUALITIES.map((q) => ({
        key: q.key,
        label: q.label,
        color: q.color,
        rows: toRows(q.list)
    }))
);

function pick(row: CostRow, key: "zuanshi" | "count" | "huang" | "hong" | "hei" | "bai") {
    const suffix = viewMode.value === "sum" ? "Sum" : "Now";
    return row[`${key}${suffix}` as keyof CostRow] as number;
}

function formatNum(n: number) {
    if (n >= 10000) {
        return `${(n / 10000).toFixed(1)}w`;
    }
    return n.toLocaleString("zh-CN");
}

function openImage(src: string) {
    window.open(src, "_blank", "noopener,noreferrer");
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
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
    align-items: center;
}

.legend-hint {
    margin: -4px 0 12px;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
}

.section {
    --q: #4f9bc4;
    margin-bottom: 14px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-left: 4px solid var(--q);
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.section-title {
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--q);

    &.plain {
        color: #1f2937;
    }
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--q);
    flex-shrink: 0;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.cost-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 12px;

    th,
    td {
        padding: 8px 4px;
        text-align: right;
        border-bottom: 1px solid #f1f5f9;
        white-space: nowrap;
        vertical-align: middle;
    }

    th {
        color: #6b7280;
        font-weight: 600;
        background: color-mix(in srgb, var(--q) 8%, #fff);
    }

    th:first-child,
    td:first-child {
        width: 12%;
        text-align: center;
    }

    .level {
        font-weight: 700;
        color: var(--q);
    }

    td {
        color: #1f2937;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    tbody tr:hover {
        background: color-mix(in srgb, var(--q) 6%, #fff);
    }
}

.img-btn {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: zoom-in;
}

.img-btn img {
    display: block;
    width: 100%;
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid #eef1f5;
}

.hint {
    margin-top: 8px;
    font-size: 12px;
    color: #9ca3af;
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

    .cost-table {
        font-size: 13px;

        th,
        td {
            padding: 8px 6px;
        }
    }

    .img-btn img {
        width: 42%;
        max-width: 480px;
    }
}
</style>
