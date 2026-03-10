import { message } from "ant-design-vue";
import axios from "axios";

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  // 超时
  timeout: 20000,
});

// 请求拦截器
service.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});
// 响应拦截器
service.interceptors.response.use((res) => {
  return res;
}, (error) => {
  message.error(error.response.data.msg);
});

export default service;
