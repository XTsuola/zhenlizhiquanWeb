<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">新增对局</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
                <a-button type="primary" :loading="saving" @click="save">保存</a-button>
            </div>
        </div>

        <div class="panel">
            <div class="filters">
                <a-select v-model:value="zhanqu" allow-clear placeholder="战区" class="field" @change="getZhanqu">
                    <a-select-option v-for="item in nowZhanquList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
                <a-select v-model:value="changci" allow-clear placeholder="场次" class="field" @change="getInfo">
                    <a-select-option v-for="item in changciList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </div>
        </div>

        <DetailPlayer>
            <template #left_name>
                <a-input v-if="!disabledFlag" v-model:value="aInfo.name" placeholder="请输入昵称" />
                <a-select
                    v-else
                    v-model:value="aInfo.name"
                    class="full"
                    placeholder="请选择昵称"
                    @change="(value: number) => getXuanshou(value, 1)"
                >
                    <a-select-option v-for="item in xuanshouSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #left_kedu>
                <a-select v-model:value="aInfo.kedu" class="full" placeholder="请选择氪度" :disabled="disabledFlag">
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #left_hero>
                <a-select
                    v-model:value="aInfo.hero"
                    class="full"
                    mode="multiple"
                    placeholder="请选择英雄顺位"
                    :disabled="disabledFlag"
                >
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #right_name>
                <a-input v-if="!disabledFlag" v-model:value="bInfo.name" placeholder="请输入昵称" />
                <a-select
                    v-else
                    v-model:value="bInfo.name"
                    class="full"
                    placeholder="请选择昵称"
                    @change="(value: number) => getXuanshou(value, 2)"
                >
                    <a-select-option v-for="item in xuanshouSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #right_kedu>
                <a-select v-model:value="bInfo.kedu" class="full" placeholder="请选择氪度" :disabled="disabledFlag">
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
            <template #right_hero>
                <a-select
                    v-model:value="bInfo.hero"
                    class="full"
                    mode="multiple"
                    placeholder="请选择英雄顺位"
                    :disabled="disabledFlag"
                >
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </template>
        </DetailPlayer>

        <div class="panel match-panel">
            <h2 class="section-title">添加对局信息</h2>
            <a-select v-model:value="nowShengfu" class="full" placeholder="请选择对局信息" :options="shengfuSelect" />
            <div class="actions-row">
                <a-button type="primary" @click="addShengfu">添加</a-button>
                <a-button @click="resetShengfu">重置</a-button>
            </div>
            <div class="section-label">对局胜负信息</div>
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
import { message } from "ant-design-vue";
import { zhanquList, changciList, keduList, shengfuSelect } from "@/utils/func";
import { getHeroList } from "@/api/hero";
import { saveShijiesaiInfo, shijiesaiSelect, type SaveShijiesaiInfoType, type XuanshouInfoType } from "@/api/shijiesai";
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
const disabledFlag = ref(false);
const saving = ref(false);
const heroSelect = ref<{ label: string; value: number }[]>([]);
const zhanqu = ref<number>();
const changci = ref<number>();
const aInfo = reactive<XuanshouInfoType>({ name: undefined, kedu: undefined, hero: [] });
const bInfo = reactive<XuanshouInfoType>({ name: undefined, kedu: undefined, hero: [] });
const shengfuList = ref<number[]>([]);
const nowShengfu = ref<number>();
const xuanshouList = ref<any[]>([]);
const xuanshouSelect = ref<any[]>([]);

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

function addShengfu() {
    if (aInfo.hero.length != 4 || bInfo.hero.length != 4) {
        message.error("请先选择完双方英雄顺位！");
        return;
    }
    if (nowShengfu.value === undefined || !(nowShengfu.value in SHENGFU_MAP)) {
        message.error("请选择对局信息！");
        return;
    }
    shengfuList.value.push(nowShengfu.value);
    nowShengfu.value = undefined;
}

function resetShengfu() {
    shengfuList.value = [];
    nowShengfu.value = undefined;
}

async function save() {
    if (!zhanqu.value || !changci.value) {
        message.error("请填写场次信息！");
        return;
    }
    if (!aInfo.name || !bInfo.name) {
        message.error("请填写昵称！");
        return;
    }
    if (aInfo.hero.length != 4 || bInfo.hero.length != 4) {
        message.error("请先选择完双方英雄顺位！");
        return;
    }
    if (!shengfuList.value.length) {
        message.error("请填写对局信息！");
        return;
    }
    saving.value = true;
    try {
        const params: SaveShijiesaiInfoType = {
            no: zhanqu.value + changci.value,
            aInfo,
            bInfo,
            shengfuList: shengfuList.value
        };
        const res = await saveShijiesaiInfo(params);
        if (res.status == 200) {
            message.success("操作成功");
            router.push("/gameList");
        }
    } finally {
        saving.value = false;
    }
}

function goBack() {
    router.push("/gameList");
}

async function getSelect() {
    const res = await shijiesaiSelect(parseInt(gameType as string));
    if (res.status == 200) {
        xuanshouList.value = res.data.data
            .filter((e: any) => e.no % 100 >= 1 && e.no % 100 <= 4)
            .map((e: any) => ({ id: e.id, no: e.no, AInfo: e.AInfo, BInfo: e.BInfo }));
    }
}

function getZhanqu() {
    if (changci.value) getInfo(changci.value);
}

function getInfo(type: number) {
    if (type > 4) {
        disabledFlag.value = true;
        const list = xuanshouList.value.filter(
            (e) => Math.floor(e.no / 100) == Math.floor((zhanqu.value as number) / 100)
        );
        xuanshouSelect.value = [];
        for (let i = 0; i < list.length; i++) {
            xuanshouSelect.value.push({
                label: list[i].AInfo.name,
                value: 2 * i,
                kedu: list[i].AInfo.kedu,
                hero: list[i].AInfo.hero
            });
            xuanshouSelect.value.push({
                label: list[i].BInfo.name,
                value: 2 * i + 1,
                kedu: list[i].BInfo.kedu,
                hero: list[i].BInfo.hero
            });
        }
    } else {
        disabledFlag.value = false;
    }
    aInfo.name = aInfo.kedu = bInfo.name = bInfo.kedu = undefined;
    aInfo.hero = [];
    bInfo.hero = [];
}

function getXuanshou(e: number, type: number) {
    const item = xuanshouSelect.value[e];
    if (!item) return;
    const target = type == 1 ? aInfo : bInfo;
    target.name = item.label;
    target.kedu = item.kedu;
    target.hero = item.hero;
}

onMounted(() => {
    getHeroData();
    getSelect();
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
    flex-wrap: wrap;
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

.section-label {
    margin: 14px 0 8px;
    font-size: 13px;
    color: #6b7280;
}

.actions-row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
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
