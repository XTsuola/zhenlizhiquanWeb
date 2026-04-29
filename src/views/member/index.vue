<template>
    <div class="memberManage">
        <div class="header">
            <div class="title">
                <div class="bold">天下谁人不识君</div>
                <div>
                    <a-button v-if="isAdmin" style="margin-right: 10px;" type="primary"
                        @click="showModal(1)">新增</a-button>
                    <a-button @click="goBack">返回</a-button>
                </div>
            </div>
        </div>
        <MyTabel :columnsData="columns" :dataSource="tableData" @edit="showModal" @delete="deleteOk"></MyTabel>
        <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false">
            <a-form ref="passwordAdd" :model="addData" name="basic" :label-col="{ span: 4 }" autocomplete="off">
                <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称!' }]">
                    <a-input v-model:value="addData.name"></a-input>
                </a-form-item>
                <a-form-item label="评分" name="score" :rules="[{ required: true, message: '请输入评分!' }]">
                    <a-input-number style="width: 100%;" :min="0" :precision="1" :max="100"
                        v-model:value="addData.score"></a-input-number>
                </a-form-item>
                <a-form-item label="称号">
                    <a-input v-model:value="addData.title"></a-input>
                </a-form-item>
                <a-form-item label="备注">
                    <a-input v-model:value="addData.remark"></a-input>
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
import { getMemberList, memberAdd, memberDelete, memberUpdate, type MemberAddType } from "@/api/member";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const isAdmin = sessionStorage.getItem("isAdmin");
const visible = ref(false);
const title = ref("新增成员");
const columns = ref<any>([
    {
        title: "序号",
        dataIndex: "index",
        key: "index",
        width: 80,
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 200
    },
    {
        title: "群贡献评级",
        dataIndex: "score",
        key: "score",
        width: 180
    }
]);
const tableData = ref<any>([]);
const addData = reactive<MemberAddType>({
    name: "",
    score: null,
    title: "",
    remark: ""
});
const passwordAdd = ref<any>();
if (isAdmin) {
    columns.value = [
        {
            title: "序号",
            dataIndex: "index",
            key: "index",
            width: 100,
        },
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            width: 160
        },
        {
            title: "群贡献评级",
            dataIndex: "score",
            key: "score",
            width: 100
        },
        {
            title: "操作",
            key: "action",
            list: ["edit", "delete"],
            width: 120
        }
    ];
}

async function getList() {
    const res = await getMemberList();
    if (res.data.code == 200) {
        tableData.value = res.data.data;
    }
}

function showModal(type: number, record?: any) {
    visible.value = true;
    if (type == 1) {
        title.value = "新增成员";
        addData.id = undefined;
        addData.score = null;
        addData.name = addData.title = addData.remark = "";
    } else if (type == 2) {
        title.value = "修改成员";
        addData.id = record.id;
        addData.name = record.name;
        addData.score = record.score;
        addData.title = record.title;
        addData.remark = record.remark;
    }
}

async function save() {
    try {
        await passwordAdd.value?.validate();
        if (title.value == "新增成员") {
            const res = await memberAdd(addData)
            if (res.data.code == 200) {
                getList();
                message.success("新增成功");
            }
        } else {
            const res = await memberUpdate(addData)
            if (res.data.code == 200) {
                getList();
                message.success("修改成功");
            }
        }
        visible.value = false;
    } catch (_) { }
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
    getList();
})

</script>
<style lang="less" scoped>
.memberManage {
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