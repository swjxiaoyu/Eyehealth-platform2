'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      console.log('登出成功')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const checkLocalStorage = () => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    console.log('LocalStorage检查:')
    console.log('- access_token:', token ? '存在' : '不存在')
    console.log('- user_data:', userData ? '存在' : '不存在')
    if (userData) {
      console.log('- 用户数据:', JSON.parse(userData))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>认证状态测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">当前状态:</h3>
            <p><strong>是否已认证:</strong> {isAuthenticated ? '✅ 是' : '❌ 否'}</p>
            <p><strong>用户信息:</strong></p>
            <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto">
              {user ? JSON.stringify(user, null, 2) : '无用户数据'}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">操作:</h3>
            <div className="flex gap-2">
              <Button onClick={checkLocalStorage} variant="outline">
                检查LocalStorage
              </Button>
              {isAuthenticated && (
                <Button onClick={handleLogout} variant="destructive">
                  登出
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">测试说明:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 如果已登录，刷新页面后应该保持登录状态</li>
              <li>• 点击&ldquo;检查LocalStorage&rdquo;查看存储的数据</li>
              <li>• 登出后会清除所有认证数据</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

