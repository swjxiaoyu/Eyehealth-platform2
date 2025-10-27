import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, ERROR_MESSAGES } from './config'

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          // 清除本地存储的token
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          // 重定向到登录页
          window.location.href = '/auth/login'
          break
        case 403:
          throw new Error(ERROR_MESSAGES.FORBIDDEN)
        case 404:
          throw new Error(ERROR_MESSAGES.NOT_FOUND)
        case 500:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR)
        default:
          throw new Error(error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR)
      }
    } else if (error.request) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    } else {
      throw new Error(error.message)
    }
  }
)

// API 接口类型定义
export interface User {
  id: string
  did: string
  email: string
  name: string
  dob?: string
  created_at: string
}

export interface RegisterUser {
  email: string
  name: string
  password: string
  dob?: string
  walletAddress?: string
}

export interface Report {
  id: string
  user_id: string
  type: 'examination' | 'prescription' | 'medical_record'
  storage_uri: string
  report_hash: string
  ipfs_cid?: string
  created_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  manufacturer_id: string
  qr_code: string
  created_at: string
}

export interface Trace {
  id: string
  product_id: string
  stage: string
  document_hash: string
  issuer: string
  timestamp: string
}

export interface Recommendation {
  id: string
  user_id: string
  input_hash: string
  result_json: Record<string, unknown>
  model_version: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  amount: number
  chain_event_hash?: string
  created_at: string
}

// 认证相关API
export const authAPI = {
  // 登录
  login: async (type: 'email' | 'wallet', payload: Record<string, unknown>) => {
    if (type === 'email') {
      // 邮箱登录直接发送email和password
      const response = await apiClient.post('/auth/login', {
        email: payload.email,
        password: payload.password,
      })
      return response.data
    } else {
      // 钱包登录发送到wallet-login端点
      const response = await apiClient.post('/auth/wallet-login', {
        walletAddress: payload.walletAddress,
        signature: payload.signature,
        message: payload.message,
      })
      return response.data
    }
  },

  // 获取钱包签名消息
  getWalletMessage: async (walletAddress: string) => {
    const response = await apiClient.post('/auth/wallet-message', {
      walletAddress,
    })
    return response.data
  },

  // 注册
  register: async (userData: RegisterUser) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  // 刷新token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // 登出
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
}

// 报告相关API
export const reportAPI = {
  // 上传报告
  upload: async (file: File, metadata: Record<string, unknown>) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))

    const response = await apiClient.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 获取用户报告列表
  getUserReports: async (userId: string) => {
    const response = await apiClient.get(`/reports/user/${userId}`)
    return response.data
  },

  // 获取报告详情
  getReport: async (reportId: string) => {
    const response = await apiClient.get(`/reports/${reportId}`)
    return response.data
  },

  // 删除报告
  deleteReport: async (reportId: string) => {
    const response = await apiClient.delete(`/reports/${reportId}`)
    return response.data
  },
}

// 产品相关API
export const productAPI = {
  // 获取产品列表
  getProducts: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  // 获取产品详情
  getProduct: async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}`)
    return response.data
  },

  // 扫描产品二维码
  scanProduct: async (qrCode: string) => {
    const response = await apiClient.get(`/products/scan/${qrCode}`)
    return response.data
  },

  // 获取产品溯源信息
  getProductTrace: async (productId: string) => {
    const response = await apiClient.get(`/product/trace/${productId}`)
    return response.data
  },
}

// 推荐相关API
export const recommendationAPI = {
  // 获取推荐
  getRecommendations: async (userId: string, context: Record<string, unknown>, topK: number = 5) => {
    const response = await apiClient.post('/recommendation', {
      user_id: userId,
      context,
      top_k: topK,
    })
    return response.data
  },

  // 获取推荐历史
  getRecommendationHistory: async (userId: string) => {
    const response = await apiClient.get(`/recommendations/user/${userId}`)
    return response.data
  },
}

// 订单相关API
export const orderAPI = {
  // 创建订单
  createOrder: async (orderData: Partial<Order>) => {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  },

  // 获取用户订单
  getUserOrders: async (userId: string) => {
    const response = await apiClient.get(`/orders/user/${userId}`)
    return response.data
  },

  // 获取订单详情
  getOrder: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`)
    return response.data
  },

  // 更新订单状态
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, {
      status,
    })
    return response.data
  },
}

// 用户相关API
export const userAPI = {
  // 获取用户信息
  getUser: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  },

  // 更新用户信息
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await apiClient.patch(`/users/${userId}`, userData)
    return response.data
  },

  // 删除用户
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/users/${userId}`)
    return response.data
  },
}

export default apiClient
