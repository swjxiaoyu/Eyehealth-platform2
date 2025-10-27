'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Save, ArrowLeft, Calendar, DollarSign, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function CreateProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    manufacturerId: '',
    manufacturerName: '',
    qrCode: '',
    barcode: '',
    price: '',
    currency: 'CNY',
    category: '',
    subcategory: '',
    expiryDate: '',
    batchNumber: '',
    serialNumber: '',
  })
  const router = useRouter()
  const { user } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSku = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    setFormData(prev => ({
      ...prev,
      sku: `EYE-${random}-${timestamp}`
    }))
  }

  const generateQrCode = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData(prev => ({
      ...prev,
      qrCode: `QR${random}${timestamp.slice(-4)}`
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        ingredients: [], // 可以后续添加成分管理
        specifications: {}, // 可以后续添加规格管理
      }

      const response = await fetch('http://localhost:3001/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('产品创建成功！')
        router.push('/products')
      } else {
        const error = await response.json()
        toast.error(error.message || '创建产品失败')
      }
    } catch (error) {
      console.error('创建产品错误:', error)
      toast.error('创建产品失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">创建新产品</h1>
              <p className="mt-2 text-gray-600">添加新的眼健康产品到系统中</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>基本信息</span>
                </CardTitle>
                <CardDescription>
                  填写产品的基本信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">产品SKU *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="sku"
                      placeholder="EYE-VIT-001"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateSku}>
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 产品名称 */}
                <div className="space-y-2">
                  <Label htmlFor="name">产品名称 *</Label>
                  <Input
                    id="name"
                    placeholder="护眼维生素胶囊"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* 产品描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">产品描述</Label>
                  <Textarea
                    id="description"
                    placeholder="请描述产品的主要功能和特点..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* 制造商信息 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturerId">制造商ID *</Label>
                    <Input
                      id="manufacturerId"
                      placeholder="MFG-001"
                      value={formData.manufacturerId}
                      onChange={(e) => handleInputChange('manufacturerId', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacturerName">制造商名称 *</Label>
                    <Input
                      id="manufacturerName"
                      placeholder="健康科技有限公司"
                      value={formData.manufacturerName}
                      onChange={(e) => handleInputChange('manufacturerName', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 标识和价格 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>标识和价格</span>
                </CardTitle>
                <CardDescription>
                  设置产品标识码和价格信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 二维码 */}
                <div className="space-y-2">
                  <Label htmlFor="qrCode">二维码 *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="qrCode"
                      placeholder="QR123456789"
                      value={formData.qrCode}
                      onChange={(e) => handleInputChange('qrCode', e.target.value)}
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateQrCode}>
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 条形码 */}
                <div className="space-y-2">
                  <Label htmlFor="barcode">条形码</Label>
                  <Input
                    id="barcode"
                    placeholder="1234567890123"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                  />
                </div>

                {/* 价格 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">价格</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="299.99"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">货币</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNY">CNY (人民币)</SelectItem>
                        <SelectItem value="USD">USD (美元)</SelectItem>
                        <SelectItem value="EUR">EUR (欧元)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 分类 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">产品分类</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="保健品">保健品</SelectItem>
                        <SelectItem value="医疗器械">医疗器械</SelectItem>
                        <SelectItem value="护眼产品">护眼产品</SelectItem>
                        <SelectItem value="药品">药品</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">子分类</Label>
                    <Input
                      id="subcategory"
                      placeholder="护眼产品"
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    />
                  </div>
                </div>

                {/* 过期日期 */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">过期日期</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 批次和序列号 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">批次号</Label>
                    <Input
                      id="batchNumber"
                      placeholder="BATCH-2024-001"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">序列号</Label>
                    <Input
                      id="serialNumber"
                      placeholder="SN123456789"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 提交按钮 */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建产品'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}







