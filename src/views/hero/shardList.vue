<template>
    <div class="shardList">
        <div style="padding: 10px;display: flex;justify-content: flex-end;">
            <!-- <a-button :type="showFlag ? 'default' : 'primary'" @click="showTogether">{{ showText }}</a-button> -->
            <a-button @click="goBack">返回</a-button>
        </div>
        <MyTabel :columnsData="columns" :dataSource="data" :rowClass="true" @level="showModal" @star="showModal"
            :loading="tableLoading">
        </MyTabel>
        <a-modal v-model:open="visible" destroyOnClose :title="levelTitle" :maskClosable="false">
            <a-table :columns="columns2" :dataSource="detailData.levelData"></a-table>
            <template #footer>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" destroyOnClose :title="starTitle" :maskClosable="false">
            <a-table :columns="columns3" :dataSource="detailData.skillData"></a-table>
            <template #footer>
                <a-button key="back" @click="visible2 = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { getShardList } from "@/api/hero";
import router from "@/router";
import MyTabel from "@/components/table.vue";

let qualityList = ["白色英雄", "蓝色英雄", "紫色英雄", "橙色英雄"];
const tableLoading = ref(false);
const originalData = ref([]);
const data = ref<any>([]);
// const nowID = ref(0);
// const nowQuality = ref(0);
// const showFlag = ref(false);
// const showText = ref("参与共创");
// const addData = ref<any>([]);
const detailData = reactive({
    id: 0,
    quality: 0,
    levelData: [],
    skillData: []
});
const visible = ref(false);
const visible2 = ref(false);
const levelTitle = ref("橙色英雄升级碎片需求");
const starTitle = ref("橙色英雄升星碎片需求");
let originalColumns = [
    {
        title: "品质",
        dataIndex: "quality",
        key: "quality",
        width: 160,
        customRender: (opt: any) => qualityList[opt.value - 1]
    },
    {
        title: "操作",
        key: "action",
        list: ["level", "star"],
        width: 80
    },
];
const columns = ref<any>();
columns.value = originalColumns;
const columns2 = ref<any>([
    {
        title: "描述",
        dataIndex: "name",
        key: "name"
    },
    {
        title: "碎片",
        dataIndex: "suipian",
        key: "suipian"
    },
    {
        title: "钻石",
        dataIndex: "zuanshi",
        key: "zuanshi"
    }
]);
const columns3 = ref<any>([
    {
        title: "描述",
        dataIndex: "name",
        key: "name"
    },
    {
        title: "碎片",
        dataIndex: "suipian",
        key: "suipian"
    }
]);

function showModal(type: number, record: any) {
    detailData.id = record.id;
    if (type == 1) {
        visible.value = true;
        levelTitle.value = qualityList[record.quality - 1] + "升级碎片需求";
        detailData.levelData = JSON.parse(record.levelData);
    } else {
        visible2.value = true;
        starTitle.value = qualityList[record.quality - 1] + "升星碎片需求";
        detailData.skillData = JSON.parse(record.skillData);
    }
}

function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    data.value = allData;
}

function goBack() {
    router.go(-1);
}

/* function showTogether(record: any) {
    if (!showFlag.value) {
        showText.value = "关闭共创";
        columns.value = [
            {
                title: "品质",
                dataIndex: "quality",
                key: "quality",
                width: 160,
                customRender: (opt: any) => qualityList[opt.value - 1]
            },
            {
                title: "操作",
                key: "action",
                list: ["level", "star"],
                width: 10
            },
        ]
    } else {
        showText.value = "参与共创";
        columns.value = originalColumns;
    }
    showFlag.value = !showFlag.value;
} */

/* async function save() {
    const params = {
        id: nowID.value,
        skillData: JSON.stringify(addData.value)
    };
    const res = await updateShard(params);
    if (res.data.code == 200) {
        message.success("操作成功");
        visible2.value = false;
        getOriginalData();
    }
} */

async function getOriginalData() {
    tableLoading.value = true;
    const res = await getShardList();
    if (res.status == 200) {
        originalData.value = res.data.data;
    }
    tableLoading.value = false;
    getList();
}

onMounted(() => {
    getOriginalData();
})

</script>
<style lang="less" scoped>
.form_div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.add_or_reduce {
    width: 100px;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    column-gap: 10px;
    transform: translateY(-5px);
}

.flex_center {
    display: flex;
    justify-self: flex-start;
    align-items: center;
}
</style>