'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { toast } from 'sonner'

interface Report {
  id: string
  type: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  reportHash: string
  metadata: {
    description?: string
    uploadDate?: string
    minioBucket?: string
    minioObjectName?: string
    encryptionKeyId?: string
    keyHash?: string
    iv?: string
    tag?: string
    isEncrypted?: boolean
  }
  isProcessed: boolean
  createdAt: string
}

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports()
    }
  }, [isAuthenticated])

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // 后端返回的是 { reports: [], total: number, page: number, limit: number }
        setReports(data.reports || [])
      } else {
        toast.error('获取报告列表失败')
      }
    } catch (error) {
      console.error('获取报告失败:', error)
      toast.error('获取报告列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('确定要删除这个报告吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        toast.success('报告删除成功')
        fetchReports() // 重新获取列表
      } else {
        toast.error('删除报告失败')
      }
    } catch (error) {
      console.error('删除报告失败:', error)
      toast.error('删除报告失败')
    }
  }

  const handleDownloadDecryptedReport = async (reportId: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/reports/${reportId}/download-decrypted`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('解密文件下载成功')
      } else {
        const error = await response.json()
        toast.error(error.message || '下载失败')
      }
    } catch (error) {
      console.error('下载错误:', error)
      toast.error('下载失败，请重试')
    }
  }

  const handleDownloadReport = async (reportId: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('文件下载成功')
      } else {
        toast.error('下载报告失败')
      }
    } catch (error) {
      console.error('下载报告失败:', error)
      toast.error('下载报告失败')
    }
  }

  const handleViewReport = async (reportId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/reports/${reportId}/view`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType === 'application/pdf') {
          // 对于PDF文件，在新窗口中打开
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          window.open(url, '_blank')
        } else {
          // 对于其他文件类型，显示提示信息
          const data = await response.json()
          toast.info(data.message || '此文件类型不支持在线预览')
        }
      } else {
        toast.error('查看报告失败')
      }
    } catch (error) {
      console.error('查看报告失败:', error)
      toast.error('查看报告失败')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      examination: '检查报告',
      prescription: '处方单',
      medical_record: '病历记录',
    }
    return typeMap[type] || type
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || report.type === filterType
    return matchesSearch && matchesFilter
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>请先登录</CardTitle>
            <CardDescription>您需要登录才能查看报告</CardDescription>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">健康报告</h1>
              <p className="text-gray-600">管理您的眼健康检查报告</p>
            </div>
            <Link href="/reports/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                上传报告
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索报告..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="筛选类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="examination">检查报告</SelectItem>
                    <SelectItem value="prescription">处方单</SelectItem>
                    <SelectItem value="medical_record">病历记录</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 报告列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报告</h3>
              <p className="text-gray-600 mb-4">您还没有上传任何健康报告</p>
              <Link href="/reports/upload">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  上传第一个报告
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {report.originalName}
                          </h3>
                          <Badge variant={report.isProcessed ? 'default' : 'secondary'}>
                            {report.isProcessed ? '已处理' : '待处理'}
                          </Badge>
                          {report.metadata?.isEncrypted && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              已加密
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(report.createdAt)}
                          </span>
                          <span>{getTypeLabel(report.type)}</span>
                          <span>{formatFileSize(report.fileSize)}</span>
                        </div>
                        {report.metadata?.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {report.metadata.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>哈希: {report.reportHash.substring(0, 16)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                      {report.metadata?.isEncrypted ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadDecryptedReport(report.id, report.originalName)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          解密下载
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadReport(report.id, report.originalName)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          下载
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
