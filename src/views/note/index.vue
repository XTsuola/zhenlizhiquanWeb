<template>
    <div class="visitorMessage">
        <div class="board">
            访客在线留言板
        </div>
        <div style="display: flex;justify-content: space-between;">
            <a-button style="background-color: #55A6DD;margin-bottom: 8px;margin-left: 5px;" type="primary"
                @click="showModal">添加留言</a-button>
            <a-button @click="goBack" style="margin-right: 5px;">返回</a-button>
        </div>
        <div class="content">
            <div class="left_div" v-for="item in list.slice((current - 1) * 4, (current - 1) * 4 + 4)">
                <div class="left_title">
                    <span class="title_title">{{ item.title }}</span>
                    <img v-if="isAdmin == 'admin'" style="cursor: pointer;margin-left: auto;"
                        src="@/assets/icon/delete_white.png" @click="deleteInfo(item)" />
                </div>
                <div class="title_name">【 {{ item.name }} / {{ item.time }} 】</div>
                <div class="left_info"> {{ item.content }}</div>
            </div>
            <a-pagination style="margin-left: 8px;" v-model:current="current" :total="list.length"
                :show-total="(total: any) => `共 ${total} 条`" :defaultPageSize="4" />
        </div>
        <a-modal v-model:open="visible" title="添加留言" centered>
            <a-form style="width: 100%;" :model="addData" name="basic" :label-col="{ span: 4 }" autocomplete="off">
                <a-form-item>
                    <a-input v-model:value="addData.title" placeholder="留言标题"></a-input>
                </a-form-item>
                <a-form-item>
                    <a-input v-model:value="addData.name" placeholder="您的昵称"></a-input>
                </a-form-item>
                <a-form-item>
                    <a-textarea style="min-height: 120px;" v-model:value="addData.content"
                        placeholder="留言内容"></a-textarea>
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button key="back" @click="visible = false">取消</a-button>
                <a-button key="submit" type="primary" :loading="loading" @click="addMesage()">提交留言</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" title="删除提示" centered>
            <div>确认删除留言吗？</div>
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
import { formatDate } from '@/utils/func';
import { getNoteList, noteAdd, noteDelete, type NoteAddType } from '@/api/note';
import router from '@/router';

const isAdmin = sessionStorage.getItem("isAdmin");
const nowId = ref("");
const visible = ref(false);
const visible2 = ref(false);
const loading = ref(false);
const list = ref<any>([]);
const addData = reactive<NoteAddType>({
    title: "",
    name: "",
    content: "",
    time: ""
});
const current = ref(1);
const timer = ref<any>(null);

function showModal() {
    visible.value = true;
    addData.title = addData.name = addData.content = "";
}

async function addMesage() {
    let msg = "";
    if (!addData.title) {
        msg = "请填写标题！";
    } else if (!addData.name) {
        msg = "请填写昵称！";
    } else if (!addData.content) {
        msg = "请填写内容！";
    }
    if (msg) {
        message.error(msg);
        return false;
    }
    addData.time = formatDate(new Date());
    const res = await noteAdd(addData);
    if (res.data.code == 200) {
        getList();
        addData.title = addData.name = addData.content = addData.time = "";
    }
    visible.value = false;
}

async function getList() {
    const res = await getNoteList()
    if (res.data.code == 200) {
        list.value = res.data.data.reverse();
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

function goBack() {
    router.go(-1);
}

timer.value = setInterval(() => {
    getList();
}, 2000);

onMounted(() => {
    getList();
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
                padding: 8px 20px;

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
        }
    }
}
</style>