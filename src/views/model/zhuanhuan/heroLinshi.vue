<template>
    <div style="border: 1px solid #ccc;">
        <div>
            <div
                style="background: #efefef;padding: 10px 0 10px 15px;border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;">
                <div style="font-weight: bold">{{ prop.detailData.name }}</div>
                <div style="margin-right: 10px;">
                    <a-button size="small" style="margin-right: 8px;" :disabled="nowlevel == 0"
                        @click="nowlevel--">上一级</a-button>
                    <a-button size="small" :disabled="nowlevel == 12" @click="nowlevel++">下一级</a-button>
                </div>
            </div>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    主种族
                </a-col>
                <a-col class="aCol" :span="18">
                     {{ zhenyinList[prop.detailData.zhu - 1] }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    副种族
                </a-col>
                <a-col class="aCol" :span="18">
                     {{ zhenyinList[prop.detailData.fu - 1] }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    图片
                </a-col>
                <a-col class="aCol" :span="18">
                    <img style="width: 70px;height: 70px;" :src="prop.detailData.img" />
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    技能名称
                </a-col>
                <a-col class="aCol" :span="18">
                     {{ prop.detailData.skillName }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    技能等级
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ nowlevel + 1 }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    效果描述
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.data[nowlevel].effect }}
                </a-col>
            </a-row>
            <a-row type="flex">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    英雄品质
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ qualityList[prop.detailData.quality - 1] }}
                </a-col>
            </a-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { qualityList, zhenyinList } from "@/utils/func";

const prop = defineProps<{
    detailData: any
}>();

const nowlevel = ref(12);

</script>
<style lang="less" scoped>
.aCol {
    padding: 5px;
    display: flex;
    align-items: center;
}
</style>