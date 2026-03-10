<template>
    <div class="cardDetail">
        <div class="header">
            <div class="title">
                <div class="bold">临时密码管理</div>
                <div>
                    <a-button style="margin-right: 10px;" type="primary" @click="showModal">新增</a-button>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData" @delete="deleteOk"></MyTabel>
        <a-modal v-model:open="visible" destroyOnClose title="新增临时密码" :maskClosable="false">
            <a-form ref="passwordAdd" :model="addData" name="basic" :label-col="{ span: 4 }" autocomplete="off">
                <a-form-item label="临时密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
                    <a-input v-model:value="addData.password"></a-input>
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
import { getFrequencyPasswordList, frequencyPasswordAdd, frequencyPasswordDelete } from "@/api/frequency";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const visible = ref(false);
const columns = ref<any>([
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 100,
    },
    {
        title: "名称",
        dataIndex: "password",
        key: "password",
        width: 200
    },
    {
        title: "操作",
        key: "action",
        list: ["delete"],
        width: 120
    },
]);
const tableData = ref<any>([]);
const addData = reactive<any>({
    password: ""
});
const passwordAdd = ref<any>();

async function getList() {
    const res = await getFrequencyPasswordList();
    if (res.data.code == 200) {
        tableData.value = res.data.data;
    }
}

function showModal() {
    visible.value = true;
    addData.password = "";
}

async function save() {
    try {
        await passwordAdd.value?.validate();
        const res = await frequencyPasswordAdd(addData)
        if (res.data.code == 200) {
            visible.value = false;
            getList();
            message.success("新增成功");
        }
    } catch (_) { }
}

async function deleteOk(id: number) {
    const res = await frequencyPasswordDelete(id);
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
    getList();
})

</script>
<style lang="less" scoped>
.cardDetail {
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