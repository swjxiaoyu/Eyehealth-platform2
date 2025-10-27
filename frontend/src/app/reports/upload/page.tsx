'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Eye, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function UploadReportPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    type: 'examination',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const router = useRouter()
  const { user } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('不支持的文件类型，请选择图片或PDF文件')
        return
      }
      
      // 检查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('文件大小不能超过10MB')
        return
      }
      
      setSelectedFile(file)
      toast.success('文件选择成功')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('请选择要上传的文件')
      return
    }

    setIsUploading(true)
    
    try {
      // 创建FormData
      const uploadData = new FormData()
      uploadData.append('file', selectedFile)
      uploadData.append('type', formData.type)
      uploadData.append('description', formData.description)
      uploadData.append('date', formData.date)
      
      // 发送上传请求
      const response = await fetch('http://localhost:3001/api/v1/reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: uploadData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.isEncrypted) {
          toast.success('报告上传并加密成功！')
        } else {
          toast.success('报告上传成功！')
        }
        router.push('/reports')
      } else {
        const error = await response.json()
        toast.error(error.message || '上传失败')
      }
    } catch (error) {
      console.error('上传错误:', error)
      toast.error('上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">上传健康报告</h1>
          <p className="mt-2 text-gray-600">上传您的眼健康检查报告，我们将为您提供专业的分析和建议</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>报告信息</span>
            </CardTitle>
            <CardDescription>
              请填写报告的基本信息，并上传相关文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 用户信息 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{user?.name}</p>
                  <p className="text-sm text-blue-700">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* 报告类型 */}
            <div className="space-y-2">
              <Label htmlFor="type">报告类型</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择报告类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="examination">检查报告</SelectItem>
                  <SelectItem value="prescription">处方单</SelectItem>
                  <SelectItem value="medical_record">病历记录</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 检查日期 */}
            <div className="space-y-2">
              <Label htmlFor="date">检查日期</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">报告描述</Label>
              <Textarea
                id="description"
                placeholder="请描述报告的主要内容或您的症状..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* 文件上传 */}
            <div className="space-y-2">
              <Label>上传文件</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {selectedFile ? selectedFile.name : '点击选择文件'}
                  </p>
                  <p className="text-sm text-gray-500">
                    支持 JPG、PNG、GIF、WebP 图片和 PDF 文件
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    最大文件大小：10MB
                  </p>
                </label>
              </div>
              {selectedFile && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      已选择文件：{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 上传按钮 */}
            <div className="flex space-x-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="flex-1"
              >
                {isUploading ? '上传中...' : '上传报告'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploading}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">上传说明</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持上传眼健康检查报告、处方单、病历记录等</li>
                <li>• 文件将进行加密存储，确保您的隐私安全</li>
                <li>• 上传后系统将自动分析并提供专业建议</li>
                <li>• 所有数据将记录到区块链，确保数据不可篡改</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


