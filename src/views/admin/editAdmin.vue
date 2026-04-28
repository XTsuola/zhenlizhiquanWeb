<template>
    <div class="admin">
        <div v-if="!isAdminFlag" class="adminLogin">
            <div>激活管理员：</div>
            <a-input style="width: 200px;" v-model:value="password" placeholder="请输入管理员密码" />
            <div>
                <a-button style="margin-right: 15px" type="primary" @click="ok">确定</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div style="padding: 5px;" v-else>
            <a-button @click="goHome" type="primary" style="margin-bottom: 15px;">返回首页</a-button>
            <div class="adminMenu">
                <div class="box lianyushenyuan white" @click="goAdmin(1)">
                    查询图表
                </div>
                <div class="box simangdiguo white" @click="goAdmin(2)">
                    查询卡组
                </div>
                <div class="box chanyigu white" @click="goAdmin(3)">
                    查询密码
                </div>
                <div class="box tiantanggang white" @click="goAdmin(4)">
                    查询消息
                </div>
                <div class="box yinmizhe white" @click="goAdmin(5)">
                    问题管理
                </div>
                <div class="box yinmizhe white" @click="goAdmin(6)">
                    答案管理
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const password = ref("");
const isAdminFlag = ref(false);

function verifyAdmin() {
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (isAdmin == "admin") {
        isAdminFlag.value = true;
    } else {
        isAdminFlag.value = false;
    }
}

function ok() {
    if (password.value == "suola666") {
        sessionStorage.setItem("isAdmin", "admin");
        message.success("激活成功！");
        verifyAdmin();
    } else {
        message.error("密码错误！");
    }
}

function goAdmin(type: number) {
    if (type == 1) {
        router.push("/msgDetail");
    } else if (type == 2) {
        router.push("/cardsAdmin");
    } else if (type == 3) {
        router.push("/passwordAdmin");
    } else if (type == 4) {
        router.push("/logList");
    } else if (type == 5) {
        router.push("/questionAdmin");
    } else if (type == 6) {
        router.push("/answerAdmin");
    }
}

function goBack() {
    router.go(-1);
}

function goHome() {
    router.push("/home");
}

onMounted(() => {
    verifyAdmin();
})

</script>
<style lang="less" scoped>
.admin {
    padding: 15px;

    .adminLogin {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        row-gap: 20px;
    }

    .adminMenu {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        row-gap: 15px;
        column-gap: 4%;

        .box {
            width: 22%;
            height: 40px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}

.simangdiguo {
    background-color: #ffa500;
}

.chanyigu {
    background-color: green;
}

.yinmizhe {
    background-color: purple;
}

.manshikuangye {
    background-color: #804400;
}

.dongshenshitu {
    background-color: #03a1c9;
}

.tiantanggang {
    background-color: #0e5d92;
}

.lianyushenyuan {
    background-color: #c01b10;
}

.white {
    color: white;
}
</style>