'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, RegisterUser, authAPI } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (type: 'email' | 'wallet', payload: Record<string, unknown>) => Promise<void>
  register: (userData: RegisterUser) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // 初始化时检查本地存储的token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const userData = localStorage.getItem('user_data')
        
        if (token && userData) {
          try {
            // 验证token有效性（可选，这里先简单检查）
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            console.log('从本地存储恢复用户状态:', parsedUser)
          } catch (parseError) {
            console.error('解析用户数据失败:', parseError)
            // 清除无效数据
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_data')
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error)
        // 清除可能损坏的数据
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (type: 'email' | 'wallet', payload: Record<string, unknown>) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login(type, payload)
      
      // 存储token和用户数据
      localStorage.setItem('access_token', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token)
      }
      localStorage.setItem('user_data', JSON.stringify(response.user))
      
      // 设置用户信息
      setUser(response.user)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterUser) => {
    try {
      setIsLoading(true)
      const response = await authAPI.register(userData)
      
      // 存储token和用户数据
      localStorage.setItem('access_token', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token)
      }
      localStorage.setItem('user_data', JSON.stringify(response.user))
      
      // 设置用户信息
      setUser(response.user)
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除所有本地存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      setUser(null)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken()
      localStorage.setItem('access_token', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token)
      }
      if (response.user) {
        localStorage.setItem('user_data', JSON.stringify(response.user))
        setUser(response.user)
      }
    } catch (error) {
      console.error('Token刷新失败:', error)
      // 刷新失败，清除本地存储并重定向到登录页
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      setUser(null)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
