<template>
    <div class="chat-container">
        <!-- 输入区域 -->
        <div class="input-area">
            <input v-model="question" placeholder="请输入你的问题" @keyup.enter="askLLM" />
            <button @click="askLLM" :disabled="isLoading">
                {{ isLoading ? "思考" : "发送" }}
            </button>
            <button style="background-color: #cccccc;" @click="goBack">
                返回
            </button>
        </div>

        <!-- 输出区域 -->
        <div class="output-area">
            <h4>小助手的回答：</h4>
            <!-- 直接渲染内容，可以配合CSS模拟打字光标 -->
            <p>{{ content }}</p>
            <!-- 如果希望渲染Markdown格式，可以用第三方库替换上面的<p> -->
            <!-- <div v-html="renderedContent"></div> -->
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { ref } from "vue";

// --- 1. 定义响应式数据 ---
const question = ref(""); // 用户输入
const content = ref(""); // AI回复的内容
const isLoading = ref(false); // 加载状态

// 从环境变量中读取API密钥，请务必将密钥保存在后端或环境变量中，避免前端暴露
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = "https://api.deepseek.com/chat/completions"; // DeepSeek API端点

// --- 2. 核心方法：调用API并处理流式响应 ---
async function askLLM() {
    if (!question.value.trim() || isLoading.value) return;
    // 重置内容，准备接收新回复
    content.value = "";
    isLoading.value = true;
    try {
        // 发起fetch请求，配置stream: true
        const response: any = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // 指定模型，也可以使用 "deepseek-reasoner"
                messages: [
                    { role: "user", content: question.value }
                ],
                stream: true // 开启流式模式
            })
        });
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        // 获取响应体的读取器
        const reader = response.body.getReader();
        const decoder = new TextDecoder(); // 用于将二进制数据解码为字符串
        let buffer = ""; // 用于缓存不完整的数据块
        // 循环读取数据流
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            // 解码当前数据块
            const chunkText = buffer + decoder.decode(value, { stream: true });
            buffer = ""; // 清空buffer，准备处理

            // DeepSeek的流式数据是按行分隔的，每行以 "data: " 开头，最后以 "data: [DONE]" 结束
            const lines = chunkText.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6); // 去掉 "data: " 前缀
                    if (dataStr === "[DONE]") {
                        // 流式传输结束
                        break
                    }
                    try {
                        // 解析JSON数据
                        const data = JSON.parse(dataStr);
                        // 从响应中提取增量内容
                        const delta = data.choices[0]?.delta?.content;
                        if (delta) {
                            // 将新内容追加到已有内容后，Vue的响应式系统会自动更新视图
                            content.value += delta;
                        }
                    } catch (parseError) {
                        // 如果解析失败，可能是因为数据块被截断，将其暂存到buffer中
                        console.warn("JSON解析失败，暂存到buffer:", parseError);
                        buffer += `data: ${dataStr}`;
                    }
                }
            }
        }
    } catch (error: any) {
        console.error("请求出错:", error);
        content.value = `出错了: ${error.message}`;
    } finally {
        isLoading.value = false;
    }
}

function goBack() {
    router.go(-1);
}

</script>

<style lang="less" scoped>
.chat-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.input-area {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.input-area input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.input-area button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.input-area button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.output-area {
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 4px;
    min-height: 100px;
}

.output-area p {
    white-space: pre-wrap;
    /* 保留空白符和换行 */
    word-wrap: break-word;
    font-size: 16px;
    line-height: 1.5;
}
</style>