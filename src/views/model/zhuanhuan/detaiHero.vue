<template>
    <div ref="drawDom">
        <div style="height: 4px;width: 100%;"></div>
        <div style="border: 1px solid #ccc;">
            <div
                style="background: #efefef;padding: 10px 0 10px 15px;border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;">
                <div style="font-weight: bold">{{ prop.detailData.name }}</div>
                <!-- <div style="margin-right: 10px;">
                    <a-button size="small" style="margin-right: 8px;" :disabled="nowlevel == 0"
                        @click="nowlevel--">上一级</a-button>
                    <a-button size="small" :disabled="nowlevel == 12" @click="nowlevel++">下一级</a-button>
                </div> -->
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
                    <img style="width: 70px;height: 70px;" :src="nowImg" />
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
                    <a-tag :color="getQualityColor(prop.detailData.quality)">{{ getQualityName(prop.detailData.quality)
                        }}</a-tag>
                </a-col>
            </a-row>
        </div>
        <div style="height: 4px;width: 100%;"></div>
    </div>
    <div style="margin-top: 20px;"><a-button @click="exportImg">导出</a-button></div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { qualityList, zhenyinList } from "@/utils/func";
import html2canvas from "html2canvas";

const prop = defineProps<{
    detailData: any
}>();

const nowlevel = ref(12);
const qualityColorList = [{
    label: "橙色",
    value: 4,
    color: "#FFA500"
}, {
    label: "紫色",
    value: 3,
    color: "#8e488e"
}, {
    label: "蓝色",
    value: 2,
    color: "#2db7f5"
}, {
    label: "白色",
    value: 1,
    color: "#cccccc"
}];

const drawDom = ref(null);
// 自定义导出尺寸 宽高
const EXPORT_WIDTH = 800
const EXPORT_HEIGHT = 600

const exportImg = async () => {
    if (!drawDom.value) return

    // 1. 先把DOM转成原始canvas
    const originCanvas = await html2canvas(drawDom.value, {
        useCORS: true,
        scale: 2, // 高清倍率
        backgroundColor: '#ffffff'
    })

    // 2. 创建指定大小的最终画布
    const targetCanvas = document.createElement('canvas')
    const ctx: any = targetCanvas.getContext('2d')
    targetCanvas.width = EXPORT_WIDTH
    targetCanvas.height = EXPORT_HEIGHT

    // 3. 居中绘制原图到指定画布（等比缩放、居中留白）
    const scale = Math.min(
        EXPORT_WIDTH / originCanvas.width,
        EXPORT_HEIGHT / originCanvas.height
    )
    const w = originCanvas.width * scale
    const h = originCanvas.height * scale
    const x = (EXPORT_WIDTH - w) / 2
    const y = (EXPORT_HEIGHT - h) / 2

    // 填充背景色
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)

    // 绘制图片
    ctx.drawImage(originCanvas, x, y, w, h)

    // 4. 下载
    const link = document.createElement('a')
    link.href = targetCanvas.toDataURL('image/png')
    link.download = `${prop.detailData.name}.png`
    link.click()
}
const urlToBase64 = (imgUrl: any) => {
    return new Promise((resolve, reject) => {
        const image = new Image()

        // 关键：解决跨域
        image.crossOrigin = 'Anonymous'

        // 防止缓存导致跨域失败
        image.src = imgUrl + '?t=' + new Date().getTime()

        image.onload = function () {
            const canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height

            const ctx: any = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0)

            // 转成base64
            const base64 = canvas.toDataURL('image/png')
            resolve(base64)
        }

        image.onerror = function (err: any) {
            reject('图片转base64失败：')
        }
    })
}
const nowImg = ref<any>('');

function getQualityName(quality: number) {
    return qualityColorList.find(e => e.value == quality)?.label;
}

function getQualityColor(quality: number) {
    return qualityColorList.find(e => e.value == quality)?.color;
}

onMounted(async () => {
    if (prop.detailData?.img) {
        nowImg.value = await urlToBase64(prop.detailData.img)
    }
});


</script>
<style lang="less" scoped>
.aCol {
    padding: 5px;
    display: flex;
    align-items: center;
}
</style>