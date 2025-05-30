import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message, Modal } from 'antd'
import qs from 'qs'
import { config } from './config'
import { getAccessToken, getRefreshToken, getTenantId, removeToken, setToken } from '@/utils/auth'
import errorCode from './errorCode'
import { useRouter } from 'react-router-dom'
import { useCache } from '@/hooks/web/useCache'

const tenantEnable = import.meta.env.VITE_APP_TENANT_ENABLE
const { result_code, base_url, request_timeout } = config

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
  '无效的刷新令牌', // 刷新令牌被删除时，不用提示
  '刷新令牌已过期' // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
]
// 是否显示重新登录
export const isRelogin = { show: false }
// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现
// 请求队列
let requestList: any[] = []
// 是否正在刷新中
let isRefreshToken = false
// 请求白名单，无须token的接口
const whiteList: string[] = ['/login', '/refresh-token']

// 创建axios实例
export const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// request拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 设置租户
    if (tenantEnable && tenantEnable === 'true') {
      const tenantId = getTenantId()
      if (tenantId) config.headers['tenant-id'] = tenantId
    }
    const method = config.method?.toUpperCase()
    // 防止 GET 请求缓存
    if (method === 'GET') {
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    }
    // 自定义参数序列化函数
    else if (method === 'POST') {
      const contentType = config.headers['Content-Type'] || config.headers['content-type']
      if (contentType === 'application/x-www-form-urlencoded') {
        if (config.data && typeof config.data !== 'string') {
          config.data = qs.stringify(config.data)
        }
      }
    }
    return config
  },
  (error: AxiosError) => {
    // Do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    let { data } = response
    const config = response.config
    if (!data) {
      // 返回"[HTTP]请求没有返回值";
      throw new Error()
    }
    // 未设置状态码则默认成功状态
    // 二进制数据则直接返回，例如说 Excel 导出
    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      // 注意：如果导出的响应为 json，说明可能失败了，不直接返回进行下载
      if (response.data.type !== 'application/json') {
        return response.data
      }
      data = await new Response(response.data).json()
    }
    const code = data.code || result_code
    // 获取错误信息
    const msg = data.msg || errorCode[code] || errorCode['default']
    if (ignoreMsgs.indexOf(msg) !== -1) {
      // 如果是忽略的错误码，直接返回 msg 异常
      return Promise.reject(msg)
    } else if (code === 401) {
      // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
      if (!isRefreshToken) {
        isRefreshToken = true
        // 1. 如果获取不到刷新令牌，则只能执行登出操作
        if (!getRefreshToken()) {
          return handleAuthorized()
        }
        // 2. 进行刷新访问令牌
        try {
          const refreshTokenRes = await refreshToken()
          // 2.1 刷新成功，则回放队列的请求 + 当前请求
          setToken((await refreshTokenRes).data.data)
          config.headers!.Authorization = 'Bearer ' + getAccessToken()
          requestList.forEach((cb: any) => {
            cb()
          })
          requestList = []
          return service(config)
        } catch (e) {
          // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
          // 2.2 刷新失败，只回放队列的请求
          requestList.forEach((cb: any) => {
            cb()
          })
          // 提示是否要登出。即不回放当前请求！不然会形成递归
          return handleAuthorized()
        } finally {
          requestList = []
          isRefreshToken = false
        }
      } else {
        // 添加到队列，等待刷新获取到新的令牌
        return new Promise((resolve) => {
          requestList.push(() => {
            config.headers!.Authorization = 'Bearer ' + getAccessToken() // 让每个请求携带自定义token 请根据实际情况自行修改
            resolve(service(config))
          })
        })
      }
    } else if (code === 500) {
      message.error('系统错误，请联系管理员')
      return Promise.reject(new Error(msg))
    } else if (code === 901) {
      message.error({
        content: '系统错误，请联系管理员',
        duration: 5
      })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      if (msg === '无效的刷新令牌') {
        // hard coding：忽略这个提示，直接登出
        console.log(msg)
        return handleAuthorized()
      } else {
        message.error(msg)
      }
      return Promise.reject('error')
    } else {
      return data
    }
  },
  (error: AxiosError) => {
    console.log('err' + error) // for debug
    let { message: errorMsg } = error
    if (errorMsg === 'Network Error') {
      errorMsg = '网络错误，请检查您的网络连接'
    } else if (errorMsg.includes('timeout')) {
      errorMsg = '请求超时，请稍后重试'
    } else if (errorMsg.includes('Request failed with status code')) {
      errorMsg = '请求失败，状态码：' + errorMsg.substr(errorMsg.length - 3)
    }
    message.error(errorMsg)
    return Promise.reject(error)
  }
)

const refreshToken = async () => {
  axios.defaults.headers.common['tenant-id'] = getTenantId()
  return await axios.post(base_url + '/system/auth/refresh-token?refreshToken=' + getRefreshToken())
}

const handleAuthorized = () => {
  if (!isRelogin.show) {
    isRelogin.show = true
    Modal.confirm({
      title: '系统提示',
      content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
      okText: '重新登录',
      cancelText: '取消',
      onOk: () => {
        // resetRouter() // 重置静态路由表
        // deleteUserCache() // 删除用户缓存
        removeToken()
        isRelogin.show = false
        // 干掉token后再走一次路由让它过router.beforeEach的校验
        window.location.href = window.location.href
      }
    })
  }
  return Promise.reject('登录状态已过期，请重新登录')
}

// 封装请求方法
const request = {
  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({ ...config, method: 'GET' })
  },
  
  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({ ...config, method: 'POST' })
  },
  
  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({ ...config, method: 'PUT' })
  },
  
  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({ ...config, method: 'DELETE' })
  },
  
  // 文件上传
  upload<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 文件下载
  download(config: AxiosRequestConfig): Promise<Blob> {
    return service.request({
      ...config,
      method: 'GET',
      responseType: 'blob'
    })
  }
}

export default request
