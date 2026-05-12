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
                    <a-button size="small" :disabled="nowlevel == 21" @click="nowlevel++">下一级</a-button>
                </div> -->
            </div>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    种族
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ zhenyinList[prop.detailData.zhenyin - 1] }}
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    等级
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ nowlevel + 1 }}
                    <!-- <a-button size="small" style="margin-left:auto;" @click="nowlevel = 9">跳转至10级</a-button> -->
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    消耗
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.cost }}
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    图片
                </a-col>
                <a-col class="aCol" :span="18">
                    <img style="width: 70px;height: 70px;" :src="nowImg" />
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    攻击
                </a-col>
                <a-col class="aCol" :span="18">
                    <span v-if="prop.detailData.type == 2 || prop.detailData.type == 3">/</span>
                    <span v-else>{{ prop.detailData.data[nowlevel].attack }}</span>
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    生命
                </a-col>
                <a-col class="aCol" :span="18">
                    <span v-if="prop.detailData.type == 2 || prop.detailData.type == 3">/</span>
                    <span v-else>{{ prop.detailData.data[nowlevel].life }}</span>
                </a-col>
            </a-row>
            <a-row type="flex" class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    效果描述
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.data[nowlevel].effect }}
                </a-col>
            </a-row>
            <a-row v-if="skinData.findIndex((e: any) => e.cardId == prop.detailData.id) != -1" type="flex"
                class="border_bottom">
                <a-col class="aCol border_right" :span="6">
                    皮肤效果
                </a-col>
                <a-col class="aCol" :span="18">
                    <div style="display: flex;justify-content: flex-start;flex-wrap: wrap;">
                        <div v-for="(value, i) in skinData.filter((e: any) => e.cardId == prop.detailData.id)">
                            【{{ value.name }}】：{{ value.effect.at(-1) }}
                            <hr v-if="i < skinData.filter((e: any) => e.cardId == prop.detailData.id).length - 1" />
                        </div>
                    </div>
                </a-col>
            </a-row>
            <a-row type="flex">
                <a-col class="aCol border_right" :span="6">
                    卡牌品质
                </a-col>
                <a-col class="aCol" :span="18">
                    <a-tag :color="getQualityColor(prop.detailData.quality)">{{ getQualityName(prop.detailData.quality)
                        }}</a-tag>
                </a-col>
            </a-row>
            <!-- <a-row type="flex" :class="showLine > 1 ? 'border_bottom' : ''">
                <a-col class="aCol border_right" :span="6">
                    卡牌评级
                </a-col>
                <a-col class="aCol" :span="18">
                    <div v-if="getGradeName(prop.detailData.grade) == 'SSS真神'" class="tagBg">
                        {{ getGradeName(prop.detailData.grade) }}
                    </div>
                    <a-tag v-else :color="getGradeColor(prop.detailData.grade)">{{ getGradeName(prop.detailData.grade)
                        }}</a-tag>
                    <a-button v-if="showLine > 0" size="small" style="margin-left:auto;" @click="showisHero">{{
                        showLine > 1
                            ?
                            "关闭" : "打开"
                    }}提升曲线</a-button>
                </a-col>
            </a-row>
            <a-row type="flex" v-if="showLine > 1">
                <a-col class="aCol border_right" :span="6">
                    成长曲线
                </a-col>
                <a-col class="aCol" :span="18">
                    <div ref="myEcharts" style="height: 300px;width: 100%;"></div>
                </a-col>
            </a-row> -->
        </div>
        <div style="height: 4px;width: 100%;"></div>
    </div>
    <div style="margin-top: 20px;"><a-button @click="exportImg">导出</a-button></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { init } from "echarts";
import { qualityList, zhenyinList } from "@/utils/func";
import html2canvas from "html2canvas";
import skinData from "@/data/skinData/skinData";

declare var window: any;
const prop = defineProps<{
    detailData: any
    level?: number
}>();

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



const nowlevel = ref(21);
if (prop.level) nowlevel.value = prop.level - 1;
const gradeList = [{
    label: "SSS真神",
    value: 7,
    color: "#000000"
}, {
    label: "SS神话",
    value: 6,
    color: "#000000"
}, {
    label: "S顶级",
    value: 5,
    color: "#ff0000"
}, {
    label: "A+超级",
    value: 4,
    color: "#ff6633"
}, {
    label: "A高级",
    value: 3,
    color: "#ff6633"
}, {
    label: "B能带",
    value: 2,
    color: "#8e488e"
}, {
    label: "C普通",
    value: 1,
    color: "#2db7f5"
}, {
    label: "D垃圾",
    value: 0,
    color: "#87d068"
}];
const qualityColorList = [{
    label: "橙卡",
    value: 4,
    color: "#FFA500"
}, {
    label: "紫卡",
    value: 3,
    color: "#8e488e"
}, {
    label: "蓝卡",
    value: 2,
    color: "#2db7f5"
}, {
    label: "白卡",
    value: 1,
    color: "#cccccc"
}];
const showLine = ref(0);
if (prop.detailData.type == 1) showLine.value = 1;
let myCharts: any = null;
const myEcharts = ref();

function getGradeName(grade: string) {
    if (grade != "") return gradeList.find(e => e.value == JSON.parse(grade)[0])?.label;
    return "暂无";
}

function getGradeColor(grade: string) {
    if (grade != "") return gradeList.find(e => e.value == JSON.parse(grade)[0])?.color;
    return "#cccccc";
}

function getQualityName(quality: number) {
    return qualityColorList.find(e => e.value == quality)?.label;
}

function getQualityColor(quality: number) {
    return qualityColorList.find(e => e.value == quality)?.color;
}

function drawLine() {
    const option = {
        legend: {
            data: ['攻击', '生命']
        },
        xAxis: {
            type: 'category',
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: "攻击",
                data: prop.detailData.data.map((e: any) => e.attack),
                type: 'line',
                showSymbol: false
            },
            {
                name: "生命",
                data: prop.detailData.data.map((e: any) => e.life),
                type: 'line',
                showSymbol: false
            }
        ]
    };
    if (myEcharts.value) {
        myCharts = init(myEcharts.value);
        myCharts.setOption(option);
    }
}

function showisHero() {
    if (showLine.value == 1) {
        showLine.value = 2;
        nextTick(() => {
            drawLine();
        })
    } else {
        showLine.value = 1;
    }
}

function resizeChart() {
    if (myCharts) myCharts.resize();
}

onMounted(async () => {
    window.addEventListener('resize', resizeChart);
    if (prop.detailData?.img) {
        nowImg.value = await urlToBase64(prop.detailData.img)
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
});

</script>
<style lang="less" scoped>
.aCol {
    padding: 5px;
    display: flex;
    align-items: center;
}

.tagBg {
    margin: 0;
    width: 60px;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    border-radius: 4px;
    background: linear-gradient(45deg,
            #111,
            #AA8B3B,
            #FFD700,
            #FF6B35,
            #E6B325,
            #C8A951,
            #111);
    background-size: 600% 600%;
    animation: colorGold 10s ease infinite;
}

@keyframes colorGold {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.border_right {
    border-right: 1px solid #ccc;
}

.border_bottom {
    border-bottom: 1px solid #ccc;
}
</style>