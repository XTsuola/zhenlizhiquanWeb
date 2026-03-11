<template>
    <div class="search">
        <div class="search_input">
            <a-select v-model:value="formState.sign" style="width: 100%;" placeholder="请选择标签">
                <a-select-option v-for="item in skillSign" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
        <div class="search_btn">
            <a-button style="margin-right: 8px;" type="primary" @click="search">查询</a-button>
            <a-button style="margin-right: 8px;" @click="reset">清空</a-button>
            <a-button @click="goBack">返回</a-button>
        </div>
    </div>
    <div class="card">
        <MyTabel :columnsData="columns" :dataSource="data" @detail="showModal"></MyTabel>
    </div>
    <a-modal v-model:open="visible" destroyOnClose title="详细信息" :maskClosable="false">
        <div style="font-weight: bold;">技能名称：{{ detailData.name }}</div>
        <div style="display: flex;justify-content: center;flex-direction: column;align-items: left;">
            <div v-for="item in detailData.data">
                <a-tag style="margin-top: 10px;" :color="levelList[item.level]">{{ item.value }}</a-tag>
            </div>
        </div>
        <template #footer>
            <a-button key="back" @click="cancel">关闭</a-button>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { chongwuSkill as skillData } from "@/data/chongwuData/z_skill";
import router from "@/router";
import MyTabel from "@/components/table.vue";

const skillSign = [{
    label: "回血",
    value: "回血",
    color: "#ffa500"
}, {
    label: "洞察",
    value: "洞察",
    color: "#800080"
}, {
    label: "护甲",
    value: "护甲",
    color: "#000000"
}, {
    label: "传承",
    value: "传承",
    color: "#9bc505"
}, {
    label: "召唤",
    value: "召唤",
    color: "#808080"
}, {
    label: "亡语",
    value: "亡语",
    color: "#000000"
}, {
    label: "直伤",
    value: "直伤",
    color: "#c01b10"
}, {
    label: "坠落伤害",
    value: "坠落伤害",
    color: "#c01b10"
}, {
    label: "投射伤害",
    value: "投射伤害",
    color: "#c01b10"
}, {
    label: "冰封",
    value: "冰封",
    color: "#03a1c9"
}, {
    label: "攻击+",
    value: "攻击+",
    color: "#c01b10"
}, {
    label: "生命+",
    value: "生命+",
    color: "#008000"
}, {
    label: "攻击-",
    value: "攻击-",
    color: "#c01b10"
}, {
    label: "生命-",
    value: "生命-",
    color: "#008000"
}, {
    label: "协战",
    value: "协战",
    color: "#ffa500"
}, {
    label: "魔防",
    value: "魔防",
    color: "#800080"
}, {
    label: "神佑",
    value: "神佑",
    color: "#9bc505"
}, {
    label: "魔免",
    value: "魔免",
    color: "#800080"
}, {
    label: "魂歌",
    value: "魂歌",
    color: "#ffa500"
}, {
    label: "磐龙",
    value: "磐龙",
    color: "#804400"
}, {
    label: "回命",
    value: "回命",
    color: "#c01b10"
}, {
    label: "践踏",
    value: "践踏",
    color: "#804400"
}, {
    label: "先攻",
    value: "先攻",
    color: "#ffa500"
}, {
    label: "穿透",
    value: "穿透",
    color: "#800080"
}, {
    label: "隐形",
    value: "隐形",
    color: "#800080"
}, {
    label: "禁疗",
    value: "禁疗",
    color: "#c01b10"
}, {
    label: "禁止攻击",
    value: "禁止攻击",
    color: "#808080"
}];
const levelList = ["#c0beba", "#808080", "#03a1c9", "#800080", "#ffa500", "#c01b10", "#000000", "#c0c018"];
const originalData = skillData.map((e: any) => {
    const list = e.type.map((v: string) => {
        return {
            name: v,
            color: skillSign.find((k: any) => k.label == v) ? skillSign.find((k: any) => k.label == v)?.color : "#808080"
        }
    });
    return {
        name: e.name,
        skillSign: list,
        data: e.data
    }
});
const formState = reactive({
    sign: undefined
});
const detailData = reactive<any>({
    name: "",
    data: []
});
const visible = ref(false);
const data = ref<any>([]);
const columns = ref<any>([
    {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: 160
    },
    {
        title: "标签",
        dataIndex: "skillSign",
        key: "skillSign",
        width: 320
    },
    {
        title: "操作",
        key: "action",
        list: ["detail"],
        width: 80
    }
]);

function getList() {
    if (formState.sign) {
        data.value = originalData.filter((item: any) => {
            let index = item.skillSign.findIndex((e: any) => e.name == formState.sign);
            if (index != -1) {
                return true;
            } else {
                return false;
            }
        });
    } else {
        data.value = originalData;
    }
}

function search() {
    getList();
}

function reset() {
    formState.sign = undefined;
    getList();
}

function goBack() {
    router.go(-1);
}

function showModal(_: number, record: any) {
    visible.value = true;
    detailData.name = record.name;
    detailData.data = record.data;
}

function cancel() {
    visible.value = false;
}

onMounted(() => {
    getList();
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

    .search_btn {
        display: flex;
        justify-content: flex-start;
        width: 40%;
    }
}
</style>