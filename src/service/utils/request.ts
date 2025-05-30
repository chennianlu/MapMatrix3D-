import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, removeToken } from '../../utils/auth';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取基础URL
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    // 这里可以根据后端的响应结构进行调整
    if (res.code !== 200) {
      // 处理业务错误
      console.error('业务错误:', res.message);
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res.data;
  },
  (error: any) => {
    console.error('响应错误:', error);
    
    // 处理HTTP错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          removeToken();
          window.location.href = '/login';
          break;
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('未知错误');
      }
    }
    
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T = any>(url: string, params?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.get(url, { params, ...config });
};

// 封装POST请求
export const post = <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.post(url, data, config);
};

// 封装PUT请求
export const put = <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.put(url, data, config);
};

// 封装DELETE请求
export const del = <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
  return service.delete(url, config);
};

export default service; 