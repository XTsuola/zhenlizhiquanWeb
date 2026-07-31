<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">第{{ title }}届—种族选取表</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :rowClass="true" :dataSource="data" :loading="tableLoading" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { heroTable } from "@/data/heroData/index";
import { shijiesaiInfoList, ShijiesaiInfoListType } from "@/api/shijiesai";
import MyTabel from "@/components/table.vue";
import router from "@/router";

const gameType = sessionStorage.getItem("gameType");
const tableLoading = ref(false);
let zhongzuData: any = [{
    id: 1,
    name: "帝国",
    count1: 0,
    count2: 0
}, {
    id: 2,
    name: "隐秘",
    count1: 0,
    count2: 0
}, {
    id: 3,
    name: "禅意",
    count1: 0,
    count2: 0
}, {
    id: 4,
    name: "港口",
    count1: 0,
    count2: 0
}, {
    id: 5,
    name: "炼狱",
    count1: 0,
    count2: 0
}, {
    id: 6,
    name: "蛮石",
    count1: 0,
    count2: 0
}, {
    id: 7,
    name: "冬神",
    count1: 0,
    count2: 0
}];
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "种族",
        dataIndex: "name",
        key: "name",
        width: 88,
        ellipsis: true
    },
    {
        title: "主",
        dataIndex: "count1",
        key: "count1",
        width: 64,
        align: "center"
    },
    {
        title: "主占比",
        dataIndex: "count1",
        key: "count1Rate",
        width: 88,
        align: "center",
        customRender: (opt: any) => getShengLv(opt.value)
    },
    {
        title: "副",
        dataIndex: "count2",
        key: "count2",
        width: 64,
        align: "center"
    },
    {
        title: "副占比",
        dataIndex: "count2",
        key: "count2Rate",
        width: 88,
        align: "center",
        customRender: (opt: any) => getShengLv(opt.value)
    }
]);
const title = ref();
title.value = gameType;

function getShengLv(value: number) {
    if (gameType == "10") {
        return ((value / 256) * 100).toFixed(2) + "%";
    } else {
        return ((value / 480) * 100).toFixed(2) + "%";
    }
}

async function getList() {
    tableLoading.value = true;
    try {
        const params: ShijiesaiInfoListType = {
            pageSize: 200,
            pageNo: 1,
            gameType: parseInt(gameType as string)
        };
        const res = await shijiesaiInfoList(params);
        if (res.status == 200) {
            let originalData = res.data.data;
            let data4 = originalData.filter((e: any) => {
                return e.no % 100 >= 1 && e.no % 100 <= 4;
            });
            for (let i = 0; i < data4.length; i++) {
                for (let j = 0; j < 4; j++) {
                    const aObj: any = heroTable.find((e: any) => e.id == data4[i].AInfo.hero[j]);
                    const bObj: any = heroTable.find((e: any) => e.id == data4[i].BInfo.hero[j]);
                    zhongzuData[aObj.zhu - 1].count1++;
                    zhongzuData[aObj.fu - 1].count2++;
                    zhongzuData[bObj.zhu - 1].count1++;
                    zhongzuData[bObj.fu - 1].count2++;
                }
            }
            data.value = zhongzuData;
        }
    } finally {
        tableLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getList();
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

.table-wrap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
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
}
</style>
