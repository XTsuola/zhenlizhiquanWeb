import { message } from "ant-design-vue";
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 20000
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error) => {
    const msg =
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.message ||
      "网络请求失败";
    message.error(msg);
    return Promise.reject(error);
  }
);

export default service;
