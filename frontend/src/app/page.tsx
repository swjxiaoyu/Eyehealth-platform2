import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Shield, Brain, Zap, Users, FileText } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">眼健康平台</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link href="/auth/register">
              <Button>注册</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            去中心化眼健康管理平台
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            基于区块链技术的安全、透明、智能的眼健康管理解决方案
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                立即开始
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                查看演示
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
          <p className="text-lg text-gray-600">
            利用先进技术为您的眼健康提供全方位保护
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <CardTitle>数据安全</CardTitle>
              </div>
              <CardDescription>
                基于区块链的去中心化存储，确保您的眼健康数据安全可控
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 端到端加密保护</li>
                <li>• 区块链哈希验证</li>
                <li>• 用户完全控制数据</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-green-600" />
                <CardTitle>AI智能推荐</CardTitle>
              </div>
              <CardDescription>
                多模态AI分析，为您推荐最适合的眼健康产品和护理方案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 多模态数据分析</li>
                <li>• 个性化推荐</li>
                <li>• 实时健康监测</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                <CardTitle>产品溯源</CardTitle>
              </div>
              <CardDescription>
                完整的供应链追溯，确保眼健康产品的真实性和质量
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 全链路溯源</li>
                <li>• 二维码验证</li>
                <li>• 防伪认证</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <CardTitle>远程医疗</CardTitle>
              </div>
              <CardDescription>
                连接专业眼科医生，提供远程咨询和诊断服务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 在线医生咨询</li>
                <li>• 视频诊断</li>
                <li>• 电子处方</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-red-600" />
                <CardTitle>健康档案</CardTitle>
              </div>
              <CardDescription>
                完整的眼健康档案管理，记录您的每一次检查和治疗
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 检查报告管理</li>
                <li>• 用药记录</li>
                <li>• 健康趋势分析</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-indigo-600" />
                <CardTitle>智能合约</CardTitle>
              </div>
              <CardDescription>
                自动化执行的眼健康服务合约，确保服务质量和透明度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 自动退款保障</li>
                <li>• 服务承诺执行</li>
                <li>• 透明计费</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技术架构</h2>
            <p className="text-lg text-gray-600">
              采用业界领先的技术栈，确保平台的稳定性和可扩展性
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Next.js", color: "bg-black text-white" },
              { name: "React", color: "bg-blue-500 text-white" },
              { name: "TypeScript", color: "bg-blue-600 text-white" },
              { name: "Hyperledger", color: "bg-purple-600 text-white" },
              { name: "Python", color: "bg-yellow-500 text-white" },
              { name: "Kubernetes", color: "bg-blue-700 text-white" },
            ].map((tech) => (
              <div key={tech.name} className="text-center">
                <Badge className={`${tech.color} px-4 py-2 text-sm font-medium`}>
                  {tech.name}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">开始您的眼健康之旅</h2>
          <p className="text-lg mb-6 opacity-90">
            加入我们，体验安全、智能、透明的眼健康管理服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                免费注册
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                联系我们
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-6 w-6" />
                <span className="text-xl font-bold">眼健康平台</span>
              </div>
              <p className="text-gray-400">
                基于区块链技术的去中心化眼健康管理平台
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">功能特性</Link></li>
                <li><Link href="/pricing">价格方案</Link></li>
                <li><Link href="/api">API文档</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">帮助中心</Link></li>
                <li><Link href="/contact">联系我们</Link></li>
                <li><Link href="/status">服务状态</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">法律</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy">隐私政策</Link></li>
                <li><Link href="/terms">服务条款</Link></li>
                <li><Link href="/security">安全声明</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 眼健康平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}