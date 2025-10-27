'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Eye, 
  User, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Monitor,
  Sun,
  Droplets,
  Heart,
  Brain
} from 'lucide-react';

interface EyeHealthProfile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  occupation: string;
  workEnvironment: string;
  dailyScreenTime: number;
  workDistance: number;
  eyeConditions: string[];
  leftEyeVision: number;
  rightEyeVision: number;
  leftEyeDegree: number;
  rightEyeDegree: number;
  astigmatismDegree: number;
  pupilDistance: number;
  wearsGlasses: boolean;
  wearsContactLens: boolean;
  glassesType: string;
  contactLensType: string;
  usesEyeDrops: boolean;
  eyeDropsFrequency: string;
  doesEyeExercises: boolean;
  eyeExerciseFrequency: string;
  symptoms: {
    dryness: number;
    fatigue: number;
    blur: number;
    headache: number;
    sensitivity: number;
    tearing: number;
  };
  lightingCondition: string;
  airHumidity: number;
  airQuality: string;
  overallScore: number;
  riskLevel: number;
  lastEyeExam: string;
  nextExamDue: string;
}

interface HealthRecord {
  id: string;
  activityType: string;
  recordedAt: string;
  screenTime: number;
  breakTime: number;
  blinkCount: number;
  blinkRate: number;
  workDistance: number;
  screenBrightness: number;
  ambientLight: number;
  roomHumidity: number;
  roomTemperature: number;
  symptoms: {
    type: string;
    severity: number;
    duration: number;
    triggers: string[];
  }[];
  exerciseType: string;
  exerciseDuration: number;
  healthScore: number;
  riskScore: number;
  notes: string;
}

interface HealthStatistics {
  totalRecords: number;
  averageHealthScore: number;
  averageRiskScore: number;
  screenTimeStats: {
    average: number;
    total: number;
    max: number;
  };
  symptomStats: Record<string, number>;
  exerciseStats: {
    count: number;
    totalDuration: number;
    averageDuration: number;
  };
  trends: {
    healthScore: string;
    riskScore: string;
  };
}

interface Recommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  action: string;
}

export default function EyeHealthPage() {
  const [profile, setProfile] = useState<EyeHealthProfile | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [statistics, setStatistics] = useState<HealthStatistics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // 表单状态
  const [profileForm, setProfileForm] = useState({
    age: '',
    gender: '',
    occupation: '',
    workEnvironment: '',
    dailyScreenTime: '',
    workDistance: '',
    eyeConditions: [] as string[],
    leftEyeVision: '',
    rightEyeVision: '',
    leftEyeDegree: '',
    rightEyeDegree: '',
    astigmatismDegree: '',
    pupilDistance: '',
    wearsGlasses: false,
    wearsContactLens: false,
    glassesType: '',
    contactLensType: '',
    usesEyeDrops: false,
    eyeDropsFrequency: '',
    doesEyeExercises: false,
    eyeExerciseFrequency: '',
    symptoms: {
      dryness: 0,
      fatigue: 0,
      blur: 0,
      headache: 0,
      sensitivity: 0,
      tearing: 0,
    },
    lightingCondition: '',
    airHumidity: '',
    airQuality: '',
  });

  const [quickRecordForm, setQuickRecordForm] = useState({
    screenTime: '',
    breakTime: '',
    symptoms: [] as {
      type: string;
      severity: number;
      duration: number;
      triggers: string[];
    }[],
    notes: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchStatistics();
    fetchRecommendations();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/eye-health/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileForm({
          age: data.age?.toString() || '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          workEnvironment: data.workEnvironment || '',
          dailyScreenTime: data.dailyScreenTime?.toString() || '',
          workDistance: data.workDistance?.toString() || '',
          eyeConditions: data.eyeConditions || [],
          leftEyeVision: data.leftEyeVision?.toString() || '',
          rightEyeVision: data.rightEyeVision?.toString() || '',
          leftEyeDegree: data.leftEyeDegree?.toString() || '',
          rightEyeDegree: data.rightEyeDegree?.toString() || '',
          astigmatismDegree: data.astigmatismDegree?.toString() || '',
          pupilDistance: data.pupilDistance?.toString() || '',
          wearsGlasses: data.wearsGlasses || false,
          wearsContactLens: data.wearsContactLens || false,
          glassesType: data.glassesType || '',
          contactLensType: data.contactLensType || '',
          usesEyeDrops: data.usesEyeDrops || false,
          eyeDropsFrequency: data.eyeDropsFrequency || '',
          doesEyeExercises: data.doesEyeExercises || false,
          eyeExerciseFrequency: data.eyeExerciseFrequency || '',
          symptoms: data.symptoms || {
            dryness: 0,
            fatigue: 0,
            blur: 0,
            headache: 0,
            sensitivity: 0,
            tearing: 0,
          },
          lightingCondition: data.lightingCondition || '',
          airHumidity: data.airHumidity?.toString() || '',
          airQuality: data.airQuality || '',
        });
      }
    } catch (error) {
      console.error('获取档案失败:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/eye-health/statistics?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/eye-health/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('获取建议失败:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/eye-health/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileForm,
          age: profileForm.age ? parseInt(profileForm.age) : null,
          dailyScreenTime: profileForm.dailyScreenTime ? parseFloat(profileForm.dailyScreenTime) : null,
          workDistance: profileForm.workDistance ? parseFloat(profileForm.workDistance) : null,
          leftEyeVision: profileForm.leftEyeVision ? parseFloat(profileForm.leftEyeVision) : null,
          rightEyeVision: profileForm.rightEyeVision ? parseFloat(profileForm.rightEyeVision) : null,
          leftEyeDegree: profileForm.leftEyeDegree ? parseFloat(profileForm.leftEyeDegree) : null,
          rightEyeDegree: profileForm.rightEyeDegree ? parseFloat(profileForm.rightEyeDegree) : null,
          astigmatismDegree: profileForm.astigmatismDegree ? parseFloat(profileForm.astigmatismDegree) : null,
          pupilDistance: profileForm.pupilDistance ? parseFloat(profileForm.pupilDistance) : null,
          airHumidity: profileForm.airHumidity ? parseFloat(profileForm.airHumidity) : null,
        }),
      });

      if (response.ok) {
        toast.success('档案保存成功');
        fetchProfile();
      } else {
        toast.error('保存失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const recordQuickData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/eye-health/quick-record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quickRecordForm,
          screenTime: quickRecordForm.screenTime ? parseInt(quickRecordForm.screenTime) : null,
          breakTime: quickRecordForm.breakTime ? parseInt(quickRecordForm.breakTime) : null,
        }),
      });

      if (response.ok) {
        toast.success('记录保存成功');
        setQuickRecordForm({
          screenTime: '',
          breakTime: '',
          symptoms: [],
          notes: '',
        });
        fetchStatistics();
      } else {
        toast.error('记录失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600';
    if (level <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <Eye className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">眼健康管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">健康档案</TabsTrigger>
          <TabsTrigger value="records">数据记录</TabsTrigger>
          <TabsTrigger value="statistics">统计分析</TabsTrigger>
          <TabsTrigger value="recommendations">健康建议</TabsTrigger>
        </TabsList>

        {/* 健康档案 */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>基本信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    placeholder="请输入年龄"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select value={profileForm.gender} onValueChange={(value) => setProfileForm({ ...profileForm, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">职业</Label>
                  <Input
                    id="occupation"
                    value={profileForm.occupation}
                    onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                    placeholder="请输入职业"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workEnvironment">工作环境</Label>
                  <Select value={profileForm.workEnvironment} onValueChange={(value) => setProfileForm({ ...profileForm, workEnvironment: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择工作环境" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">办公室</SelectItem>
                      <SelectItem value="home">居家办公</SelectItem>
                      <SelectItem value="outdoor">户外</SelectItem>
                      <SelectItem value="laboratory">实验室</SelectItem>
                      <SelectItem value="studio">工作室</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyScreenTime">每日屏幕使用时间（小时）</Label>
                  <Input
                    id="dailyScreenTime"
                    type="number"
                    step="0.5"
                    value={profileForm.dailyScreenTime}
                    onChange={(e) => setProfileForm({ ...profileForm, dailyScreenTime: e.target.value })}
                    placeholder="请输入每日屏幕使用时间"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workDistance">工作距离（厘米）</Label>
                  <Input
                    id="workDistance"
                    type="number"
                    value={profileForm.workDistance}
                    onChange={(e) => setProfileForm({ ...profileForm, workDistance: e.target.value })}
                    placeholder="请输入工作距离"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>视力状况</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leftEyeVision">左眼视力</Label>
                  <Input
                    id="leftEyeVision"
                    type="number"
                    step="0.1"
                    value={profileForm.leftEyeVision}
                    onChange={(e) => setProfileForm({ ...profileForm, leftEyeVision: e.target.value })}
                    placeholder="请输入左眼视力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rightEyeVision">右眼视力</Label>
                  <Input
                    id="rightEyeVision"
                    type="number"
                    step="0.1"
                    value={profileForm.rightEyeVision}
                    onChange={(e) => setProfileForm({ ...profileForm, rightEyeVision: e.target.value })}
                    placeholder="请输入右眼视力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leftEyeDegree">左眼度数</Label>
                  <Input
                    id="leftEyeDegree"
                    type="number"
                    value={profileForm.leftEyeDegree}
                    onChange={(e) => setProfileForm({ ...profileForm, leftEyeDegree: e.target.value })}
                    placeholder="请输入左眼度数"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rightEyeDegree">右眼度数</Label>
                  <Input
                    id="rightEyeDegree"
                    type="number"
                    value={profileForm.rightEyeDegree}
                    onChange={(e) => setProfileForm({ ...profileForm, rightEyeDegree: e.target.value })}
                    placeholder="请输入右眼度数"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={loading}>
              {loading ? '保存中...' : '保存档案'}
            </Button>
          </div>
        </TabsContent>

        {/* 数据记录 */}
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>快速记录</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screenTime">屏幕使用时间（分钟）</Label>
                  <Input
                    id="screenTime"
                    type="number"
                    value={quickRecordForm.screenTime}
                    onChange={(e) => setQuickRecordForm({ ...quickRecordForm, screenTime: e.target.value })}
                    placeholder="请输入屏幕使用时间"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakTime">休息时间（分钟）</Label>
                  <Input
                    id="breakTime"
                    type="number"
                    value={quickRecordForm.breakTime}
                    onChange={(e) => setQuickRecordForm({ ...quickRecordForm, breakTime: e.target.value })}
                    placeholder="请输入休息时间"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  value={quickRecordForm.notes}
                  onChange={(e) => setQuickRecordForm({ ...quickRecordForm, notes: e.target.value })}
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>
              <Button onClick={recordQuickData} disabled={loading} className="w-full">
                {loading ? '记录中...' : '记录数据'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 统计分析 */}
        <TabsContent value="statistics" className="space-y-6">
          {statistics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">健康评分</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(statistics.averageHealthScore)}`}>
                      {statistics.averageHealthScore}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      30天平均评分
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">屏幕时间</CardTitle>
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statistics.screenTimeStats.average}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      平均每日分钟数
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">护眼操</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statistics.exerciseStats.count}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      30天完成次数
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>健康趋势</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>健康评分趋势</span>
                      <Badge variant={statistics.trends.healthScore === 'improving' ? 'default' : 
                                   statistics.trends.healthScore === 'declining' ? 'destructive' : 'secondary'}>
                        {statistics.trends.healthScore === 'improving' ? '上升' : 
                         statistics.trends.healthScore === 'declining' ? '下降' : '稳定'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>风险评分趋势</span>
                      <Badge variant={statistics.trends.riskScore === 'decreasing' ? 'default' : 
                                   statistics.trends.riskScore === 'increasing' ? 'destructive' : 'secondary'}>
                        {statistics.trends.riskScore === 'decreasing' ? '下降' : 
                         statistics.trends.riskScore === 'increasing' ? '上升' : '稳定'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 健康建议 */}
        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {rec.priority === 'high' ? <AlertTriangle className="h-5 w-5 text-red-500" /> : 
                     rec.priority === 'medium' ? <Clock className="h-5 w-5 text-yellow-500" /> : 
                     <CheckCircle className="h-5 w-5 text-green-500" />}
                    <span>{rec.title}</span>
                  </CardTitle>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority === 'high' ? '高优先级' : 
                     rec.priority === 'medium' ? '中优先级' : '低优先级'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">{rec.description}</p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">建议行动：</p>
                  <p className="text-sm text-blue-700">{rec.action}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {recommendations.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无建议</h3>
                <p className="text-gray-600">您的眼健康状况良好，继续保持！</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
