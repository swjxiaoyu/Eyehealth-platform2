'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Brain, Upload, Search, Star, Package, TrendingUp, Eye, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Recommendation {
  product_id: string
  product_name: string
  score: number
  reason: string
  category: string
  price: number
  description: string
}

interface AnalysisResult {
  analysis_type: string
  file_type: string
  file_size: number
  result: Record<string, unknown>
  timestamp: string
}

export default function RecommendationPage() {
  const [userContext, setUserContext] = useState({
    age: 30,
    gender: 'unknown',
    eye_conditions: [] as string[],
    screen_time: 8,
    sleep_hours: 7,
    work_type: 'office',
    symptoms: [] as string[],
    preferences: [] as string[],
    budget_range: [100, 500] as [number, number]
  })
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const eyeConditions = ['近视', '远视', '散光', '干眼症', '视疲劳', '黄斑变性']
  const symptoms = ['眼干', '眼疲劳', '视力模糊', '眼部疼痛', '畏光', '流泪']
  const workTypes = ['office', 'design', 'programming', 'teaching', 'driving', 'other']
  const preferences = ['天然成分', '无防腐剂', '便携性', '性价比', '品牌信誉']

  const handleGetRecommendations = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('user_id', 'user_001')
      formData.append('context', JSON.stringify(userContext))
      formData.append('top_k', '5')

      const response = await fetch('http://localhost:8000/api/v1/recommendation', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
        toast.success('推荐生成成功！')
      } else {
        toast.error('推荐生成失败')
      }
    } catch (error) {
      console.error('推荐请求失败:', error)
      toast.error('网络连接失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast.error('请先选择文件')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('analysis_type', 'multimodal')

      const response = await fetch('http://localhost:8000/api/v1/analyze', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisResult(data)
        toast.success('文件分析完成！')
      } else {
        toast.error('文件分析失败')
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      toast.error('网络连接失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protective_equipment':
        return 'bg-blue-100 text-blue-800'
      case 'supplements':
        return 'bg-green-100 text-green-800'
      case 'equipment':
        return 'bg-purple-100 text-purple-800'
      case 'medication':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'protective_equipment': '防护用品',
      'supplements': '营养补充',
      'equipment': '设备器械',
      'medication': '药品'
    }
    return categoryNames[category] || category
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI智能推荐
          </h1>
          <p className="text-gray-600">基于多模态数据分析的个性化眼健康产品推荐</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 用户信息输入 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                个人信息
              </CardTitle>
              <CardDescription>
                请填写您的个人信息以获得个性化推荐
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 年龄 */}
              <div>
                <Label htmlFor="age">年龄</Label>
                <Input
                  id="age"
                  type="number"
                  value={userContext.age}
                  onChange={(e) => setUserContext({ ...userContext, age: parseInt(e.target.value) || 30 })}
                  min="1"
                  max="100"
                />
              </div>

              {/* 性别 */}
              <div>
                <Label htmlFor="gender">性别</Label>
                <Select value={userContext.gender} onValueChange={(value) => setUserContext({ ...userContext, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                    <SelectItem value="unknown">不愿透露</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 工作类型 */}
              <div>
                <Label htmlFor="work_type">工作类型</Label>
                <Select value={userContext.work_type} onValueChange={(value) => setUserContext({ ...userContext, work_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择工作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">办公室工作</SelectItem>
                    <SelectItem value="design">设计工作</SelectItem>
                    <SelectItem value="programming">编程开发</SelectItem>
                    <SelectItem value="teaching">教学工作</SelectItem>
                    <SelectItem value="driving">驾驶工作</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 屏幕使用时间 */}
              <div>
                <Label htmlFor="screen_time">每日屏幕使用时间（小时）</Label>
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4" />
                  <Slider
                    value={[userContext.screen_time]}
                    onValueChange={(value) => setUserContext({ ...userContext, screen_time: value[0] })}
                    max={16}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{userContext.screen_time}h</span>
                </div>
              </div>

              {/* 睡眠时间 */}
              <div>
                <Label htmlFor="sleep_hours">每日睡眠时间（小时）</Label>
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4" />
                  <Slider
                    value={[userContext.sleep_hours]}
                    onValueChange={(value) => setUserContext({ ...userContext, sleep_hours: value[0] })}
                    max={12}
                    min={4}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{userContext.sleep_hours}h</span>
                </div>
              </div>

              {/* 眼部状况 */}
              <div>
                <Label>眼部状况（可多选）</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {eyeConditions.map((condition) => (
                    <label key={condition} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userContext.eye_conditions.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserContext({
                              ...userContext,
                              eye_conditions: [...userContext.eye_conditions, condition]
                            })
                          } else {
                            setUserContext({
                              ...userContext,
                              eye_conditions: userContext.eye_conditions.filter(c => c !== condition)
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 症状 */}
              <div>
                <Label>当前症状（可多选）</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {symptoms.map((symptom) => (
                    <label key={symptom} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userContext.symptoms.includes(symptom)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserContext({
                              ...userContext,
                              symptoms: [...userContext.symptoms, symptom]
                            })
                          } else {
                            setUserContext({
                              ...userContext,
                              symptoms: userContext.symptoms.filter(s => s !== symptom)
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 预算范围 */}
              <div>
                <Label>预算范围（元）</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="最低"
                    value={userContext.budget_range[0]}
                    onChange={(e) => setUserContext({
                      ...userContext,
                      budget_range: [parseInt(e.target.value) || 0, userContext.budget_range[1]]
                    })}
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="最高"
                    value={userContext.budget_range[1]}
                    onChange={(e) => setUserContext({
                      ...userContext,
                      budget_range: [userContext.budget_range[0], parseInt(e.target.value) || 1000]
                    })}
                    className="w-20"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGetRecommendations} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    生成推荐中...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    获取AI推荐
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 文件上传分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                文件分析
              </CardTitle>
              <CardDescription>
                上传检查报告或图片进行AI分析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">选择文件</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                {uploadedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    已选择: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button 
                onClick={handleFileUpload} 
                disabled={isLoading || !uploadedFile}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>

              {analysisResult && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>分析类型:</strong> {analysisResult.analysis_type}</p>
                      <p><strong>文件类型:</strong> {analysisResult.file_type}</p>
                      <p><strong>文件大小:</strong> {(analysisResult.file_size / 1024).toFixed(2)} KB</p>
                      {((analysisResult.result as Record<string, unknown>).recommendations as string[]) && (
                        <div>
                          <p><strong>建议:</strong></p>
                          <ul className="list-disc list-inside">
                            {((analysisResult.result as Record<string, unknown>).recommendations as string[]).map((rec: string, index: number) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 推荐结果 */}
        {recommendations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                推荐结果
              </CardTitle>
              <CardDescription>
                基于您的个人信息生成的个性化推荐
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <Card key={rec.product_id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{rec.product_name}</CardTitle>
                          <CardDescription className="mt-1">
                            {rec.description}
                          </CardDescription>
                        </div>
                        <Badge className={getCategoryColor(rec.category)}>
                          {getCategoryName(rec.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 推荐分数 */}
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">推荐度</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${rec.score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{(rec.score * 100).toFixed(0)}%</span>
                      </div>

                      {/* 价格 */}
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">¥{rec.price}</span>
                      </div>

                      {/* 推荐理由 */}
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>推荐理由:</strong> {rec.reason}
                        </p>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          查看详情
                        </Button>
                        <Button size="sm" className="flex-1">
                          立即购买
                        </Button>
                      </div>
                    </CardContent>
                    
                    {/* 排名标识 */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}




