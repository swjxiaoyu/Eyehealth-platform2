import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API 配置
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000',
  BLOCKCHAIN_RPC_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'http://localhost:7051',
} as const

// 存储配置
export const STORAGE_CONFIG = {
  S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT || 'http://localhost:9000',
  S3_BUCKET: process.env.NEXT_PUBLIC_S3_BUCKET || 'eyehealth-reports',
  IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
} as const

// 应用配置
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || '去中心化眼健康管理平台',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
} as const

// 认证配置
export const AUTH_CONFIG = {
  DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'your-auth-domain.com',
  CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID || 'your-client-id',
} as const

// 文件类型配置
export const FILE_TYPES = {
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const

// 路由配置
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  REPORTS: '/reports',
  PRODUCTS: '/products',
  RECOMMENDATIONS: '/recommendations',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  UNAUTHORIZED: '未授权访问，请重新登录',
  FORBIDDEN: '权限不足，无法访问此资源',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  FILE_TOO_LARGE: '文件大小超过限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
  UPLOAD_FAILED: '文件上传失败',
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  UPLOAD_SUCCESS: '文件上传成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
} as const

