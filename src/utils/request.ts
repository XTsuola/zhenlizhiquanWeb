import { message } from "ant-design-vue";
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";

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

/** 统一请求：保留 AxiosResponse，兼容现有 `res.status` / `res.data` 用法 */
export function request<T = any>(config: AxiosRequestConfig) {
  return service.request<any, AxiosResponse<T>>(config);
}

export const get = <T = any>(url: string, params?: object, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: "get", params });

export const post = <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: "post", data });

export const patch = <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: "patch", data });

export const del = <T = any>(url: string, params?: object, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: "delete", params });

export const delBody = <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: "delete", data });

export { service };
export default request;
