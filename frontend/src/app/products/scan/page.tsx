'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, Search, Package, Calendar, MapPin, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface TraceRecord {
  id: string
  stage: string
  documentHash: string
  issuer: string
  issuerName: string
  location: string
  timestamp: string
  temperature?: number
  humidity?: number
  certificateUrl?: string
  isVerified: boolean
}

interface ProductInfo {
  id: string
  sku: string
  name: string
  description: string
  manufacturerName: string
  qrCode: string
  category: string
  expiryDate: string
  batchNumber: string
  isVerified: boolean
  traceRecords: TraceRecord[]
}

export default function ProductScanPage() {
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null)
  const [error, setError] = useState('')

  const handleScan = async () => {
    if (!qrCode.trim()) {
      toast.error('请输入产品二维码')
      return
    }

    setIsLoading(true)
    setError('')
    setProductInfo(null)

    try {
      const response = await fetch(`http://localhost:3001/api/v1/products/qr/${qrCode}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProductInfo(data)
        toast.success('产品信息获取成功')
      } else {
        const errorData = await response.json()
        setError(errorData.message || '产品不存在或二维码无效')
        toast.error('产品信息获取失败')
      }
    } catch (error) {
      console.error('扫描产品失败:', error)
      setError('网络连接失败，请检查网络连接')
      toast.error('扫描失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'manufacturing':
        return 'bg-blue-100 text-blue-800'
      case 'packaging':
        return 'bg-green-100 text-green-800'
      case 'shipping':
        return 'bg-yellow-100 text-yellow-800'
      case 'retail':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageName = (stage: string) => {
    const stageNames: { [key: string]: string } = {
      'manufacturing': '生产制造',
      'packaging': '包装',
      'shipping': '运输',
      'retail': '零售',
      'quality_check': '质量检测',
      'storage': '仓储'
    }
    return stageNames[stage] || stage
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">产品溯源扫描</h1>
          <p className="text-gray-600">扫描产品二维码查看完整的供应链信息</p>
        </div>

        {/* 扫描区域 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              产品扫描
            </CardTitle>
            <CardDescription>
              输入产品二维码或手动输入产品编号进行查询
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="输入产品二维码或编号"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                className="flex-1"
              />
              <Button 
                onClick={handleScan} 
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    扫描中...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    扫描
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert className="mb-8" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 产品信息 */}
        {productInfo && (
          <div className="space-y-6">
            {/* 产品基本信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {productInfo.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      SKU: {productInfo.sku} | 制造商: {productInfo.manufacturerName}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={productInfo.isVerified ? "default" : "secondary"}
                    className={productInfo.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                  >
                    {productInfo.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        已验证
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        待验证
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">产品描述</p>
                    <p className="text-sm">{productInfo.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">产品类别</p>
                    <Badge variant="outline">{productInfo.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">批次号</p>
                    <p className="text-sm font-mono">{productInfo.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">有效期</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(productInfo.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 溯源记录 */}
            <Card>
              <CardHeader>
                <CardTitle>供应链溯源记录</CardTitle>
                <CardDescription>
                  完整的产品生产和流通记录，确保产品安全和质量
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productInfo.traceRecords.map((record, index) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStageBadgeColor(record.stage)}>
                            {getStageName(record.stage)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(record.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Badge 
                          variant={record.isVerified ? "default" : "secondary"}
                          className={record.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {record.isVerified ? "已验证" : "待验证"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">执行方</p>
                          <p className="font-medium">{record.issuerName || record.issuer}</p>
                        </div>
                        {record.location && (
                          <div>
                            <p className="text-gray-600 mb-1">地点</p>
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {record.location}
                            </p>
                          </div>
                        )}
                        {record.temperature && (
                          <div>
                            <p className="text-gray-600 mb-1">温度</p>
                            <p>{record.temperature}°C</p>
                          </div>
                        )}
                        {record.humidity && (
                          <div>
                            <p className="text-gray-600 mb-1">湿度</p>
                            <p>{record.humidity}%</p>
                          </div>
                        )}
                      </div>

                      {record.certificateUrl && (
                        <div className="mt-3 pt-3 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(record.certificateUrl, '_blank')}
                          >
                            查看证书
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}






