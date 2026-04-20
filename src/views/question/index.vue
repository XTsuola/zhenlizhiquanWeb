<template>
    <div class="visitorMessage">
        <div class="board">
            每日一题 {{ questionObj.time }}
        </div>
        <div class="content">
            <div class="left_div">
                <div class="question_info">
                    <div class="question_title">今日题目：</div>
                    <div class="space">{{ questionObj.id ? questionObj.info : "暂无" }}</div>
                </div>
            </div>
        </div>
        <div style="display: flex;justify-content: space-between;">
            <span>
                <a-button :disabled="!questionObj.id" style="margin-bottom: 8px;margin-left: 5px;" type="primary"
                    @click="showModal">立刻答题</a-button>
                <a-button :disabled="!questionObj.id" style="margin-bottom: 8px;margin-left: 8px;"
                    @click="answerFlag = !answerFlag">{{ !answerFlag
                        ? "查看答案" : "关闭答案" }}</a-button>
            </span>
            <a-button @click="goBack" style="margin-right: 5px;">返回</a-button>
        </div>
        <div v-if="answerFlag" class="content">
            <div class="left_div" v-for="item in list">
                <div class="left_title">
                    <span class="title_title">【 {{ item.name }} / {{ item.time }} 】</span>
                    <img v-if="isAdmin == 'admin'" style="cursor: pointer;margin-left: auto;"
                        src="@/assets/icon/delete_white.png" @click="deleteInfo(item)" />
                </div>
                <div class="left_info"> {{ item.content }}</div>
            </div>
        </div>
        <a-modal v-model:open="visible" title="您的答案" centered>
            <a-form style="width: 100%;" :model="addData" name="basic" :label-col="{ span: 4 }" autocomplete="off">
                <a-form-item>
                    <a-input v-model:value="addData.name" placeholder="您的昵称"></a-input>
                </a-form-item>
                <a-form-item>
                    <a-textarea style="min-height: 120px;" v-model:value="addData.content"
                        placeholder="您的答案（理由）"></a-textarea>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button key="back" @click="visible = false">取消</a-button>
                <a-button key="submit" type="primary" :loading="loading" @click="addAnswer()">提交留言</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" title="删除提示" centered>
            <div>确认删除回答吗？</div>
            <template #footer>
                <a-button key="back" @click="visible2 = false">取消</a-button>
                <a-button key="submit" type="primary" :loading="loading" @click="deleteOk()">确认</a-button>
            </template>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { formatDate, formatDate2 } from '@/utils/func';
import { noteDelete } from '@/api/note';
import { answerAdd, getAnswerList, questionDetail, type AnswerAddType } from '@/api/question';
import router from '@/router';

const isAdmin = sessionStorage.getItem("isAdmin");
const nowId = ref("");
const visible = ref(false);
const visible2 = ref(false);
const loading = ref(false);
const list = ref<any>([]);
const addData = reactive<AnswerAddType>({
    questionId: undefined,
    name: "",
    content: "",
    time: ""
});
const current = ref(1);
const timer = ref<any>(null);
const questionObj = reactive({
    id: undefined,
    info: "",
    time: ""
});
const answerFlag = ref(false);

function showModal() {
    visible.value = true;
    addData.name = addData.content = addData.time = "";
}

async function addAnswer() {
    let msg = "";
    if (!addData.name) {
        msg = "请填写昵称！";
    } else if (!addData.content) {
        msg = "请填写回答！";
    }
    if (msg) {
        message.error(msg);
        return false;
    }
    addData.time = formatDate(new Date());
    addData.questionId = questionObj.id;
    const res = await answerAdd(addData);
    if (res.data.code == 200) {
        getList();
        addData.name = addData.content = addData.time = "";
        answerFlag.value = true;
    }
    visible.value = false;
}

async function getList() {
    const res = await getAnswerList(questionObj.id)
    if (res.data.code == 200) {
        list.value = res.data.data;
    }
}

function deleteInfo(item: any) {
    nowId.value = item.id;
    visible2.value = true;
}

async function deleteOk() {
    loading.value = true;
    const res = await noteDelete(nowId.value);
    if (res.data.code == 200) {
        visible2.value = false;
        if (current.value > 1 && (list.value.length % 3) == 1) current.value--;
        getList();
    }
    loading.value = false;
}

async function getQuestion() {
    questionObj.id = undefined;
    questionObj.info = questionObj.time = "";
    const res = await questionDetail();
    if (res.data.code == 200) {
        if (res.data.data.id == 0) return false;
        questionObj.id = res.data.data.id;
        questionObj.info = res.data.data.info;
        questionObj.time = formatDate2(res.data.data.time);
    }
    getList();
}

function goBack() {
    router.go(-1);
}

timer.value = setInterval(() => {
    getList();
}, 2000);

onMounted(() => {
    getQuestion();
})

onUnmounted(() => {
    if (timer.value) clearInterval(timer.value);
})

</script>
<style lang="less" scoped>
.visitorMessage {
    width: 100vw;

    .board {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        font-weight: bold;
        color: #ffffff;
        height: 100px;
        width: 100%;
        margin-top: 10px;
        margin-bottom: 15px;
        border-radius: 10px;
        background: linear-gradient(to right, rgb(97, 98, 218), rgb(10, 240, 238));
    }

    .content {
        flex: 1;

        .left_div {
            margin-bottom: 20px;
            border-radius: 8px;
            overflow: hidden;
            font-size: 12px;

            .left_title {
                background-color: #55A6DD;
                color: #ffffff;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                padding: 8px 10px;

                .title_title {
                    margin-right: 20px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            .title_name {
                background-color: #55A6DD;
                color: #ffffff;
                padding-left: 8px;
                padding-bottom: 8px;
            }

            .left_info {
                background-color: #F0F0F0;
                padding: 20px;
                white-space: normal;
                word-break: break-all;
                overflow: hidden;

                .info_title {
                    width: 64px;
                }

                .info_content {
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                }
            }

            .question_info {
                background-color: #F0F0F0;
                padding: 20px;
                white-space: normal;
                word-break: break-all;
                overflow: hidden;
                font-size: 14px;

                .info_title {
                    width: 64px;
                }

                .info_content {
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                }

                .question_title {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
            }
        }
    }

    .bold {
        font-weight: bold;
    }

    .space {
        line-height: 1.8;
    }
}
</style>