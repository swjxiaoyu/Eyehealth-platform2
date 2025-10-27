'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Mail, Lock, Wallet, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { walletService } from '@/lib/wallet.service'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    setIsMetaMaskInstalled(walletService.isMetaMaskInstalled())
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login('email', { email, password })
      toast.success('登录成功')
      router.push('/dashboard')
    } catch (error) {
      toast.error('登录失败，请检查您的凭据')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!isMetaMaskInstalled) {
        toast.error('请先安装MetaMask钱包')
        return
      }

      // 连接钱包
      const walletInfo = await walletService.connectWallet()
      setWalletAddress(walletInfo.address)

      // 获取签名消息
      const messageData = await authAPI.getWalletMessage(walletInfo.address)
      
      // 签名消息
      const signatureResult = await walletService.signMessage(messageData.message)

      // 登录
      await login('wallet', {
        walletAddress: signatureResult.address,
        signature: signatureResult.signature,
        message: messageData.message,
      })

      toast.success('钱包登录成功')
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('钱包登录失败:', error)
      const errorMessage = error instanceof Error ? error.message : '钱包登录失败'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <Eye className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">眼健康平台</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">登录账户</CardTitle>
            <CardDescription className="text-center">
              选择您的登录方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">邮箱登录</TabsTrigger>
                <TabsTrigger value="wallet">钱包登录</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="请输入您的邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="请输入您的密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="wallet">
                <div className="space-y-4">
                  {!isMetaMaskInstalled ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            需要安装MetaMask钱包
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            请先安装MetaMask浏览器扩展程序
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => window.open('https://metamask.io/', '_blank')}
                      >
                        安装MetaMask
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              使用MetaMask登录
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              点击下方按钮连接您的MetaMask钱包
                            </p>
                          </div>
                        </div>
                      </div>

                      {walletAddress && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>已连接钱包:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        className="w-full"
                        disabled={isLoading}
                        onClick={handleWalletLogin}
                      >
                        {isLoading ? '连接中...' : walletAddress ? '签名登录' : '连接MetaMask'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{' '}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  立即注册
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:underline">
                返回首页
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

