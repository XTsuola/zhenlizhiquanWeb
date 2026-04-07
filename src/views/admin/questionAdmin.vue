<template>
    <div class="questionAdmin">
        <div class="header">
            <div class="title">
                <div class="bold">每日问题管理</div>
                <div>
                    <a-button style="margin-right: 10px;" type="primary" @click="showModal">新增</a-button>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData"></MyTabel>
        <a-modal v-model:open="visible" destroyOnClose title="新增每日问题" :maskClosable="false">
            <a-form ref="passwordAdd" :model="addData" name="basic" :label-col="{ span: 4 }" autocomplete="off">
                <a-form-item label="每日问题" name="info" :rules="[{ required: true, message: '请输入问题!' }]">
                    <a-textarea style="min-height: 180px;" v-model:value="addData.info"></a-textarea>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button key="add" type="primary" @click="save">保存</a-button>
                <a-button key="back" @click="visible = false">关闭</a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { message } from "ant-design-vue";
import { getQuestionList, questionAdd } from "@/api/question";
import router from "@/router";
import MyTabel from "@/components/table.vue";
import { formatDate } from "@/utils/func";


const visible = ref(false);
const columns = ref<any>([
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
    },
    {
        title: "题目",
        dataIndex: "info",
        key: "info"
    },
    {
        title: "时间",
        dataIndex: "time",
        key: "time",
        width: 180
    },
]);
const tableData = ref<any>([]);
const addData = reactive<any>({
    info: "",
    time: ""
});
const passwordAdd = ref<any>();

async function getList() {
    const res = await getQuestionList();
    if (res.data.code == 200) {
        tableData.value = res.data.data;
    }
}

function showModal() {
    visible.value = true;
    addData.info = addData.time = "";
}

async function save() {
    addData.time = formatDate(new Date());
    try {
        await passwordAdd.value?.validate();
        const res = await questionAdd(addData)
        if (res.data.code == 200) {
            visible.value = false;
            getList();
            message.success("新增成功");
        }
    } catch (_) { }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    getList();
})

</script>
<style lang="less" scoped>
.questionAdmin {
    .header {
        padding: 10px;

        .title {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
</style>