<template>
    <div class="search">
        <div class="search_select">
            <a-select v-model:value="formState.zhenyin" style="width: 100%;" placeholder="请选择种族">
                <a-select-option v-for="item in zhenyinList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
        <div class="search_select">
            <a-select v-model:value="formState.cost" style="width: 100%;" placeholder="请选择费用">
                <a-select-option v-for="item in costList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
    </div>
    <div class="search">
        <div class="search_input">
            <a-input v-model:value="formState.name" placeholder="请输入名称" />
        </div>
    </div>
    <div class="search">
        <div class="search_div">
            <div class="search_btn">
                <a-button style="margin-right: 12px;" type="primary" @click="search">查询</a-button>
                <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
            <div>
                <a-button style="margin-right: 8px;" type="primary" @click="showModal(1)">新增皮肤</a-button>
            </div>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal" @edit="showModal"
            :loading="tableLoading"></MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose :title="title" :maskClosable="false">
        <a-form ref="skinDiyAddRef" style="width: 100%;" :model="addData" name="basic" :label-col="{ span: 4 }"
            autocomplete="off">
            <a-form-item label="原始皮肤" name="cardId"
                :rules="[{ required: title != '皮肤详情' ? true : false, message: '请选择原始皮肤!' }]">
                <a-select v-model:value="addData.cardId" placeholder="请选择" :disabled="title == '皮肤详情'">
                    <a-select-option v-for="item in skinSelect" :key="item.cardId" :value="item.cardId">{{
                        item.name
                        }}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="皮肤名称" name="name"
                :rules="[{ required: title != '皮肤详情' ? true : false, message: '请输入皮肤名称!' }]">
                <a-input v-model:value="addData.name" placeholder="请输入" :readonly="title == '皮肤详情'" />
            </a-form-item>
            <a-form-item label="技能名称">
                <a-input v-model:value="addData.skill" placeholder="请输入" :readonly="title == '皮肤详情'" />
            </a-form-item>
            <a-form-item label="皮肤效果" name="effect"
                :rules="[{ required: title != '皮肤详情' ? true : false, message: '请输入皮肤效果!' }]">
                <a-textarea v-model:value="addData.effect" placeholder="请输入" style="height: 100px;"
                    :readonly="title == '皮肤详情'"></a-textarea>
            </a-form-item>
            <a-form-item label="设计理由" name="reason"
                :rules="[{ required: title != '皮肤详情' ? true : false, message: '请输入设计理由!' }]">
                <a-textarea v-model:value="addData.reason" placeholder="请输入" style="height: 100px;"
                    :readonly="title == '皮肤详情'"></a-textarea>
            </a-form-item>
            <a-form-item label="其他备注">
                <a-textarea v-model:value="addData.remark" placeholder="请输入" style="height: 60px;"
                    :readonly="title == '皮肤详情'"></a-textarea>
            </a-form-item>
            <a-form-item v-if="title == '修改皮肤'" label="管理员密码" name="password"
                :rules="[{ required: true, message: '请输入管理员密码!' }]">
                <a-input v-model:value="addData.password" placeholder="请输入" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button key="back" @click="visible = false">关闭</a-button>
            <a-button v-if="title != '皮肤详情'" key="submit" type="primary" :loading="loading" @click="handleOk">保存
            </a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { costList, skinSelect } from "@/utils/func";
import { getSkinDiyList, skinDiyAdd, skinDiyUpdate, type SkinDiyAddType } from "@/api/skin";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const loading = ref(false);
const tableLoading = ref(false);
const originalData = ref([]);
const zhenyinList = [{
    label: "全部",
    value: ""
}, {
    label: "帝国",
    value: 1
}, {
    label: "隐秘",
    value: 2
}, {
    label: "禅意",
    value: 3
}, {
    label: "港口",
    value: 4
}, {
    label: "炼狱",
    value: 5
}, {
    label: "蛮石",
    value: 6
}, {
    label: "冬神",
    value: 7
}];
const formState = reactive({
    name: "",
    zhenyin: undefined,
    cost: undefined
});
const visible = ref(false);
const skinDiyAddRef = ref<any>();
const title = ref("新增皮肤");
const data = ref<any>([]);
let originalColumns = [
    {
        title: "头像",
        dataIndex: "headImg",
        key: "headImg",
        width: 50,
        scopedSlots: { customRender: "pic" }
    },
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "效果",
        dataIndex: "effect",
        key: "effect",
        width: 160
    },
    {
        title: "操作",
        key: "action",
        list: ["detail", "edit"],
        width: 50
    },
];
const columns = ref<any>();
columns.value = originalColumns;
const addData = reactive<SkinDiyAddType>({
    id: undefined,
    cardId: undefined,
    name: "",
    skill: "",
    effect: "",
    reason: "",
    remark: "",
    password: ""
});

function getList() {
    let allData: any = JSON.parse(JSON.stringify(originalData.value));
    for (let i = 0; i < allData.length; i++) {
        const obj: any = skinSelect.find((e: any) => e.cardId == allData[i].cardId);
        allData[i].img = import.meta.env.VITE_APP_BASE_URL + "skinImg" + obj.img + ".png";
        allData[i].zhenyin = obj.zhenyin;
        allData[i].cost = obj.cost;
    }
    if (formState.name) {
        allData = allData.filter((item: any) => item.name.includes(formState.name));
    }
    if (formState.cost != undefined && formState.cost !== "") {
        allData = allData.filter((item: any) => item.cost == formState.cost);
    }
    if (formState.zhenyin != undefined && formState.zhenyin != "") {
        allData = allData.filter((item: any) => item.zhenyin == formState.zhenyin);
    }
    data.value = allData;
}

function search() {
    getList();
}

function reset() {
    formState.name = "";
    formState.zhenyin = formState.cost = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(type: number, record?: any) {
    visible.value = true;
    addData.id = undefined;
    addData.password = "";
    if (type == 1) {
        title.value = "新增皮肤"
        addData.cardId = undefined;
        addData.name = addData.skill = addData.effect = addData.reason = addData.remark = "";
    } else if (type == 2) {
        title.value = "修改皮肤"
        addData.id = record.id;
        addData.cardId = record.cardId;
        addData.name = record.name;
        addData.skill = record.skill;
        addData.effect = record.effect;
        addData.reason = record.reason;
        addData.remark = record.remark;
    } else if (type == 3) {
        title.value = "皮肤详情"
        addData.id = record.id;
        addData.cardId = record.cardId;
        addData.name = record.name;
        addData.skill = record.skill;
        addData.effect = record.effect;
        addData.reason = record.reason;
        addData.remark = record.remark;
    }
}

async function getOriginalData() {
    tableLoading.value = true;
    const res = await getSkinDiyList();
    if (res.status == 200) {
        const data = res.data.data.reverse();
        originalData.value = data;
    }
    tableLoading.value = false;
    getList();
}

async function handleOk() {
    loading.value = true;
    try {
        await skinDiyAddRef.value?.validate();
        if (title.value == "新增密码") {
            const params: SkinDiyAddType = {
                cardId: addData.cardId,
                name: addData.name,
                skill: addData.skill,
                effect: addData.effect,
                reason: addData.reason,
                remark: addData.remark
            };
            const res = await skinDiyAdd(params);
            if (res.data.code == 200) {
                message.success("新增成功");
                visible.value = false;
                getOriginalData();
            }
        } else {
            const params: SkinDiyAddType = {
                id: addData.id,
                cardId: addData.cardId,
                name: addData.name,
                skill: addData.skill,
                effect: addData.effect,
                reason: addData.reason,
                remark: addData.remark,
                password: addData.password
            };
            const res = await skinDiyUpdate(params);
            if (res.data.code == 200) {
                message.success("修改成功");
                visible.value = false;
                getOriginalData();
            }
        }

    } catch (_) { }
    loading.value = false;
}

onMounted(() => {
    getOriginalData();
})

</script>
<style lang="less" scoped>
.search {
    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;
    padding: 5px 10px;
    margin-bottom: 5px;

    .search_input {
        width: 40%;
        margin-right: 10px;
    }

    .search_select {
        width: 40%;
        margin-right: 10px;
    }

    .search_div {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .search_btn {
        display: flex;
        justify-content: flex-start;
        width: 40%;
    }

}

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