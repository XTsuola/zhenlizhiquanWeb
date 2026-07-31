<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">群贡献榜</h1>
            <div class="actions">
                <a-button v-if="isAdmin" type="primary" @click="showModal(1)">新增</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="table-wrap">
            <MyTabel :columnsData="columns" :dataSource="tableData" :loading="tableLoading" @edit="showModal"
                @delete="deleteOk" />
        </div>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false"
            :width="isNarrow ? '92%' : 480" centered>
            <a-form ref="formRef" :model="addData" :label-col="{ span: isNarrow ? 24 : 5 }"
                :wrapper-col="{ span: isNarrow ? 24 : 19 }" :layout="isNarrow ? 'vertical' : 'horizontal'"
                autocomplete="off">
                <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称!' }]">
                    <a-input v-model:value="addData.name" placeholder="请输入名称" />
                </a-form-item>
                <a-form-item label="贡献" name="donation" :rules="[{ required: true, message: '请输入贡献!' }]">
                    <a-input-number v-model:value="addData.donation" class="full-field" :min="0" :precision="2" />
                </a-form-item>
                <a-form-item label="评分" name="score" :rules="[{ required: true, message: '请输入评分!' }]">
                    <a-input-number v-model:value="addData.score" class="full-field" :min="0" :max="100"
                        :precision="1" />
                </a-form-item>
                <a-form-item label="称号">
                    <a-input v-model:value="addData.title" placeholder="选填" />
                </a-form-item>
                <a-form-item label="备注">
                    <a-input v-model:value="addData.remark" placeholder="选填" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button type="primary" :loading="saving" @click="save">保存</a-button>
                <a-button @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";
import { message } from "ant-design-vue";
import { getMemberList, memberAdd, memberDelete, memberUpdate, type MemberAddType } from "@/api/member";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const isAdmin = !!sessionStorage.getItem("isAdmin");
const visible = ref(false);
const title = ref("新增成员");
const tableLoading = ref(false);
const saving = ref(false);
const tableData = ref<any[]>([]);
const formRef = ref<any>();
const isNarrow = ref(window.innerWidth < 576);
const baseColumns = [
    { title: "序号", dataIndex: "index", key: "index", width: 56, align: "center" },
    { title: "名称", dataIndex: "name", key: "name", ellipsis: true, minWidth: 96 },
    { title: "贡献", dataIndex: "donation", key: "donation", width: 88, align: "right" },
    { title: "评级", dataIndex: "score", key: "score", width: 96, align: "center" }
];
const columns = computed(() => {
    if (!isAdmin) return baseColumns;
    return [
        ...baseColumns,
        {
            title: "操作",
            key: "action",
            list: ["edit", "delete"],
            width: 110,
            fixed: "right",
            align: "center"
        }
    ];
});

const addData = reactive<MemberAddType>({
    name: "",
    donation: 0,
    score: null,
    title: "",
    remark: ""
});

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

async function getList() {
    tableLoading.value = true;
    try {
        const res = await getMemberList();
        if (res.data.code == 200) {
            tableData.value = res.data.data;
        }
    } finally {
        tableLoading.value = false;
    }
}

function showModal(type: number, record?: any) {
    visible.value = true;
    if (type == 1) {
        title.value = "新增成员";
        addData.id = undefined;
        addData.donation = 0;
        addData.score = null;
        addData.name = addData.title = addData.remark = "";
    } else if (type == 2) {
        title.value = "修改成员";
        addData.id = record.id;
        addData.donation = record.donation;
        addData.name = record.name;
        addData.score = record.score;
        addData.title = record.title;
        addData.remark = record.remark;
    }
}

async function save() {
    try {
        await formRef.value?.validate();
        saving.value = true;
        if (title.value == "新增成员") {
            const res = await memberAdd(addData);
            if (res.data.code == 200) {
                await getList();
                message.success("新增成功");
            }
        } else {
            const res = await memberUpdate(addData);
            if (res.data.code == 200) {
                await getList();
                message.success("修改成功");
            }
        }
        visible.value = false;
    } catch (_) {
    } finally {
        saving.value = false;
    }
}

async function deleteOk(id: number) {
    const res = await memberDelete(id);
    if (res.data.code == 200) {
        message.success("删除成功");
    } else {
        message.error("删除失败");
    }
    getList();
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getList();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
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
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.table-wrap {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.full-field {
    width: 100%;
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
