'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Eye,
  Activity,
  Heart,
  Monitor,
  Clock,
  Target,
  Award
} from 'lucide-react';

interface HealthData {
  date: string;
  healthScore: number;
  riskScore: number;
  screenTime: number;
  breakTime: number;
  exerciseCount: number;
  symptoms: {
    dryness: number;
    fatigue: number;
    blur: number;
    headache: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
  }[];
}

export default function AnalyticsPage() {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchHealthData();
  }, [timeRange]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/api/v1/eye-health/statistics?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 模拟数据，实际应该从API获取
        setHealthData(generateMockData(parseInt(timeRange)));
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      // 使用模拟数据
      setHealthData(generateMockData(parseInt(timeRange)));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (days: number): HealthData[] => {
    const data: HealthData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        healthScore: Math.floor(Math.random() * 30) + 70, // 70-100
        riskScore: Math.floor(Math.random() * 40) + 10,   // 10-50
        screenTime: Math.floor(Math.random() * 300) + 300, // 300-600分钟
        breakTime: Math.floor(Math.random() * 120) + 60,   // 60-180分钟
        exerciseCount: Math.floor(Math.random() * 5),      // 0-5次
        symptoms: {
          dryness: Math.floor(Math.random() * 10),
          fatigue: Math.floor(Math.random() * 10),
          blur: Math.floor(Math.random() * 10),
          headache: Math.floor(Math.random() * 10),
        },
      });
    }
    
    return data;
  };

  const getHealthScoreChartData = (): ChartData => ({
    labels: healthData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: '健康评分',
        data: healthData.map(d => d.healthScore),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: '风险评分',
        data: healthData.map(d => d.riskScore),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  });

  const getScreenTimeChartData = (): ChartData => ({
    labels: healthData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: '屏幕时间 (分钟)',
        data: healthData.map(d => d.screenTime),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: '休息时间 (分钟)',
        data: healthData.map(d => d.breakTime),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
      },
    ],
  });

  const getSymptomChartData = (): ChartData => {
    const latestData = healthData[healthData.length - 1];
    if (!latestData) return { labels: [], datasets: [] };

    return {
      labels: ['干涩', '疲劳', '模糊', '头痛'],
      datasets: [
        {
          label: '症状严重程度',
          data: [
            latestData.symptoms.dryness,
            latestData.symptoms.fatigue,
            latestData.symptoms.blur,
            latestData.symptoms.headache,
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
        },
      ],
    };
  };

  const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const first = data[0];
    const last = data[data.length - 1];
    const diff = last - first;
    if (Math.abs(diff) < 2) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAverage = (data: number[]): number => {
    return data.length > 0 ? Math.round(data.reduce((sum, val) => sum + val, 0) / data.length) : 0;
  };

  const getMax = (data: number[]): number => {
    return data.length > 0 ? Math.max(...data) : 0;
  };

  const getMin = (data: number[]): number => {
    return data.length > 0 ? Math.min(...data) : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">数据分析</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">最近7天</SelectItem>
              <SelectItem value="30">最近30天</SelectItem>
              <SelectItem value="90">最近90天</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchHealthData} disabled={loading}>
            {loading ? '加载中...' : '刷新数据'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="health">健康趋势</TabsTrigger>
          <TabsTrigger value="screen">屏幕使用</TabsTrigger>
          <TabsTrigger value="symptoms">症状分析</TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均健康评分</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {getAverage(healthData.map(d => d.healthScore))}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(calculateTrend(healthData.map(d => d.healthScore)))}
                  <span className={getTrendColor(calculateTrend(healthData.map(d => d.healthScore)))}>
                    {calculateTrend(healthData.map(d => d.healthScore)) === 'up' ? '上升' : 
                     calculateTrend(healthData.map(d => d.healthScore)) === 'down' ? '下降' : '稳定'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均屏幕时间</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(getAverage(healthData.map(d => d.screenTime)) / 60)}h
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(calculateTrend(healthData.map(d => d.screenTime)))}
                  <span className={getTrendColor(calculateTrend(healthData.map(d => d.screenTime)))}>
                    {calculateTrend(healthData.map(d => d.screenTime)) === 'up' ? '增加' : 
                     calculateTrend(healthData.map(d => d.screenTime)) === 'down' ? '减少' : '稳定'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">护眼操次数</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {getAverage(healthData.map(d => d.exerciseCount))}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(calculateTrend(healthData.map(d => d.exerciseCount)))}
                  <span className={getTrendColor(calculateTrend(healthData.map(d => d.exerciseCount)))}>
                    {calculateTrend(healthData.map(d => d.exerciseCount)) === 'up' ? '增加' : 
                     calculateTrend(healthData.map(d => d.exerciseCount)) === 'down' ? '减少' : '稳定'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">风险评分</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {getAverage(healthData.map(d => d.riskScore))}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(calculateTrend(healthData.map(d => d.riskScore)))}
                  <span className={getTrendColor(calculateTrend(healthData.map(d => d.riskScore)))}>
                    {calculateTrend(healthData.map(d => d.riskScore)) === 'up' ? '上升' : 
                     calculateTrend(healthData.map(d => d.riskScore)) === 'down' ? '下降' : '稳定'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 数据范围统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>健康评分范围</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最高</span>
                    <span className="font-medium text-green-600">{getMax(healthData.map(d => d.healthScore))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最低</span>
                    <span className="font-medium text-red-600">{getMin(healthData.map(d => d.healthScore))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">平均</span>
                    <span className="font-medium">{getAverage(healthData.map(d => d.healthScore))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>屏幕时间范围</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最长</span>
                    <span className="font-medium text-red-600">{Math.round(getMax(healthData.map(d => d.screenTime)) / 60)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最短</span>
                    <span className="font-medium text-green-600">{Math.round(getMin(healthData.map(d => d.screenTime)) / 60)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">平均</span>
                    <span className="font-medium">{Math.round(getAverage(healthData.map(d => d.screenTime)) / 60)}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>护眼操统计</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最多</span>
                    <span className="font-medium text-green-600">{getMax(healthData.map(d => d.exerciseCount))}次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最少</span>
                    <span className="font-medium text-red-600">{getMin(healthData.map(d => d.exerciseCount))}次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">平均</span>
                    <span className="font-medium">{getAverage(healthData.map(d => d.exerciseCount))}次</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 健康趋势 */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5" />
                <span>健康评分趋势</span>
              </CardTitle>
              <CardDescription>查看您的健康评分和风险评分变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">图表组件需要集成图表库</p>
                  <p className="text-sm text-gray-500">建议使用 Chart.js 或 Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 屏幕使用 */}
        <TabsContent value="screen" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>屏幕使用分析</span>
              </CardTitle>
              <CardDescription>分析您的屏幕使用时间和休息时间</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">屏幕使用图表</p>
                  <p className="text-sm text-gray-500">显示屏幕时间和休息时间对比</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 症状分析 */}
        <TabsContent value="symptoms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>症状分析</span>
              </CardTitle>
              <CardDescription>分析各种症状的严重程度分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">症状分布饼图</p>
                  <p className="text-sm text-gray-500">显示干涩、疲劳、模糊、头痛等症状分布</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 症状详细数据 */}
          {healthData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>最新症状数据</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(healthData[healthData.length - 1].symptoms).map(([symptom, severity]) => (
                    <div key={symptom} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{severity}</div>
                      <div className="text-sm text-gray-600 capitalize">{symptom}</div>
                      <Badge variant={severity > 7 ? 'destructive' : severity > 4 ? 'secondary' : 'default'}>
                        {severity > 7 ? '严重' : severity > 4 ? '中等' : '轻微'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
