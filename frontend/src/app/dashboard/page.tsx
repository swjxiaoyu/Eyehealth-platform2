'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
  User,
  Settings,
  Upload,
  Scan,
  Database,
  Link as LinkIcon,
  Activity,
  Heart,
  Brain,
  Trophy,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>请先登录</CardTitle>
            <CardDescription>您需要登录才能访问仪表板</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button className="w-full">登录</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">注册</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 模拟数据
  const stats = {
    totalReports: 12,
    totalProducts: 8,
    totalOrders: 5,
    aiRecommendations: 3
  }

  const recentReports = [
    { id: '1', type: 'examination', date: '2024-01-15', status: 'processed' },
    { id: '2', type: 'prescription', date: '2024-01-10', status: 'pending' },
    { id: '3', type: 'medical_record', date: '2024-01-08', status: 'processed' }
  ]

  const recentOrders = [
    { id: 'ORD-001', product: '护眼维生素', amount: 299, status: 'delivered' },
    { id: 'ORD-002', product: '蓝光眼镜', amount: 599, status: 'shipped' },
    { id: 'ORD-003', product: '眼药水', amount: 89, status: 'pending' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">眼健康管理平台</h1>
                <p className="text-gray-600">欢迎回来，{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </Badge>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  设置
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">眼健康评分</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">85</div>
              <p className="text-xs text-muted-foreground">
                较上周 +5 分
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">健康报告</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                本月新增 3 份报告
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">推荐产品</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                AI推荐 3 个新产品
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">订单数量</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                待处理 1 个订单
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI推荐</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiRecommendations}</div>
              <p className="text-xs text-muted-foreground">
                基于您的健康数据
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用功能快速入口</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/reports/upload">
                  <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-6 w-6" />
                    <span>上传报告</span>
                  </Button>
                </Link>
                <Link href="/eye-health">
                  <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Heart className="h-6 w-6" />
                    <span>眼健康管理</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/recommendations">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Brain className="h-6 w-6" />
                    <span>AI推荐</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>设置</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/blockchain">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <LinkIcon className="h-6 w-6" />
                    <span>区块链溯源</span>
                  </Button>
                </Link>
                <Link href="/ipfs">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Database className="h-6 w-6" />
                    <span>IPFS存储</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/gamification">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Trophy className="h-6 w-6" />
                    <span>游戏化中心</span>
                  </Button>
                </Link>
                <Link href="/products/scan">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <Scan className="h-6 w-6" />
                    <span>产品扫码</span>
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/cart">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <ShoppingCart className="h-6 w-6" />
                    <span>购物车</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>数据分析</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近报告</CardTitle>
              <CardDescription>您最近的健康报告</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium capitalize">{report.type}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {report.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant={report.status === 'processed' ? 'default' : 'secondary'}>
                      {report.status === 'processed' ? '已处理' : '待处理'}
                    </Badge>
                  </div>
                ))}
                <Link href="/reports">
                  <Button variant="outline" className="w-full">查看所有报告</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 最近订单 */}
        <Card>
          <CardHeader>
            <CardTitle>最近订单</CardTitle>
            <CardDescription>您的购买记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{order.product}</p>
                      <p className="text-sm text-gray-500">订单号: {order.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">¥{order.amount}</p>
                    <Badge variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'shipped' ? 'secondary' : 'outline'
                    }>
                      {order.status === 'delivered' ? '已送达' :
                       order.status === 'shipped' ? '已发货' : '待处理'}
                    </Badge>
                  </div>
                </div>
              ))}
              <Link href="/orders">
                <Button variant="outline" className="w-full">查看所有订单</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}