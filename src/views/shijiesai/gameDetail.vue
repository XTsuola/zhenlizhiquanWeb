<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">对局详情</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="panel">
            <div class="filters">
                <a-select v-model:value="zhanqu" class="field" placeholder="战区" disabled>
                    <a-select-option v-for="item in nowZhanquList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-select v-model:value="changci" class="field" placeholder="场次" disabled>
                    <a-select-option v-for="item in changciList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </div>
        </div>

        <DetailPlayer>
            <template #left_name>
                <a-input v-model:value="aInfo.name" placeholder="请输入昵称" disabled />
            </template>
            <template #left_kedu>
                <a-select v-model:value="aInfo.kedu" class="full" placeholder="请选择氪度" disabled>
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #left_hero>
                <a-select v-model:value="aInfo.hero" class="full" mode="multiple" placeholder="请选择英雄顺位" disabled>
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #right_name>
                <a-input v-model:value="bInfo.name" placeholder="请输入昵称" disabled />
            </template>
            <template #right_kedu>
                <a-select v-model:value="bInfo.kedu" class="full" placeholder="请选择氪度" disabled>
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #right_hero>
                <a-select v-model:value="bInfo.hero" class="full" mode="multiple" placeholder="请选择英雄顺位" disabled>
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
        </DetailPlayer>

        <div class="panel match-panel">
            <h2 class="section-title">对局胜负信息</h2>
            <div v-if="!matchRows.length" class="empty">暂无对局</div>
            <div v-for="(row, index) in matchRows" :key="index" class="match-row" :style="{ color: row.color }">
                <span>{{ row.left }}</span>
                <span class="match-vs">{{ row.str }}</span>
                <span>{{ row.right }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { zhanquList, changciList, keduList } from "@/utils/func";
import { getHeroList } from "@/api/hero";
import type { XuanshouInfoType } from "@/api/shijiesai";
import router from "@/router";
import DetailPlayer from "../model/detailPalyer.vue";

const SHENGFU_MAP: Record<number, { str: string; color: string }> = {
    0: { str: "弃权", color: "#9ca3af" },
    1: { str: "战胜", color: "#87d068" },
    2: { str: "战败", color: "#f50" },
    3: { str: "战胜（无效）", color: "#87d068" },
    4: { str: "战败（无效）", color: "#f50" }
};

const gameType = sessionStorage.getItem("gameType");
const nowZhanquList = buildZhanquOptions(gameType);
const heroSelect = ref<{ label: string; value: number }[]>([]);
const zhanqu = ref<number>();
const changci = ref<number>();
const aInfo = reactive<XuanshouInfoType>({ name: "", kedu: undefined, hero: [] });
const bInfo = reactive<XuanshouInfoType>({ name: "", kedu: undefined, hero: [] });
const shengfuList = ref<number[]>([]);

const matchRows = computed(() =>
    shengfuList.value.map((value, index) => {
        const i = index % 4;
        const meta = SHENGFU_MAP[value] || { str: "-", color: "#6b7280" };
        return {
            ...meta,
            left: heroSelect.value.find((e) => e.value == aInfo.hero[i])?.label || "-",
            right: heroSelect.value.find((e) => e.value == bInfo.hero[i])?.label || "-"
        };
    })
);

function buildZhanquOptions(gtStr: string | null) {
    const gt = parseInt(gtStr || "7", 10);
    let list = [...zhanquList];
    if (gtStr === "10") list = list.slice(0, 8);
    if (gt > 7) {
        return list.map((e) => ({
            label: e.label,
            value: e.value - 70000 + gt * 10000
        }));
    }
    return list.map((e) => ({ label: e.label, value: e.value }));
}

async function getHeroData() {
    const res = await getHeroList();
    if (res.status == 200) {
        heroSelect.value = res.data.data.map((e: any) => ({ label: e.name, value: e.id }));
    }
}

function getshijiesaiDetail() {
    const raw = sessionStorage.getItem("changciInfo");
    if (!raw) return;
    const data = JSON.parse(raw);
    zhanqu.value = Math.floor(data.no / 100) * 100;
    changci.value = data.no % 100;
    aInfo.name = data.AInfo.name;
    aInfo.hero = data.AInfo.hero;
    aInfo.kedu = data.AInfo.kedu;
    bInfo.name = data.BInfo.name;
    bInfo.hero = data.BInfo.hero;
    bInfo.kedu = data.BInfo.kedu;
    shengfuList.value = data.shengfuList;
}

function goBack() {
    router.push("/gameList");
}

onMounted(() => {
    getHeroData();
    getshijiesaiDetail();
});
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

.panel {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.field,
.full {
    width: 100%;
}

.match-panel {
    margin-top: 12px;
}

.section-title {
    margin: 0 0 12px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1f2937;
}

.empty {
    color: #9ca3af;
    font-size: 13px;
}

.match-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
}

.match-vs {
    margin: 0 4px;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
