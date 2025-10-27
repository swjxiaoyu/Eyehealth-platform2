'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Gift,
  Crown,
  Zap,
  Calendar,
  Activity,
  Eye,
  Monitor,
  Clock,
  CheckCircle,
  Users,
  Medal
} from 'lucide-react';

interface UserPoints {
  totalPoints: number;
  availablePoints: number;
  spentPoints: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  requirements: {
    target: number;
    current: number;
    unit: string;
  };
  rewards: {
    type: string;
    amount: number;
    description: string;
  }[];
  isCompleted: boolean;
  completedAt?: string;
  progress: number;
}

interface DailyChallenge {
  id: string;
  challengeDate: string;
  challenges: {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    points: number;
    isCompleted: boolean;
  }[];
  totalPoints: number;
  completedChallenges: number;
  isCompleted: boolean;
}

interface PointTransaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  transactionDate: string;
}

interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  level: number;
  name: string;
}

export default function GamificationPage() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [pointsRes, achievementsRes, challengeRes, transactionsRes, leaderboardRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/gamification/points', { headers }),
        fetch('http://localhost:3001/api/v1/gamification/achievements', { headers }),
        fetch('http://localhost:3001/api/v1/gamification/challenge/today', { headers }),
        fetch('http://localhost:3001/api/v1/gamification/transactions?limit=10', { headers }),
        fetch('http://localhost:3001/api/v1/gamification/leaderboard?limit=10', { headers }),
      ]);

      if (pointsRes.ok) setUserPoints(await pointsRes.json());
      if (achievementsRes.ok) setAchievements(await achievementsRes.json());
      if (challengeRes.ok) setTodayChallenge(await challengeRes.json());
      if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      if (leaderboardRes.ok) setLeaderboard(await leaderboardRes.json());
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/gamification/challenge/progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId, progress }),
      });

      if (response.ok) {
        toast.success('挑战进度更新成功');
        fetchUserData();
      } else {
        toast.error('更新失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      calendar: Calendar,
      activity: Activity,
      eye: Eye,
      monitor: Monitor,
      clock: Clock,
      trophy: Trophy,
      star: Star,
      award: Award,
      crown: Crown,
      medal: Medal,
    };
    const IconComponent = icons[iconName] || Trophy;
    return <IconComponent className="h-5 w-5" />;
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'badge': return <Award className="h-4 w-4 text-blue-500" />;
      case 'token': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <Gift className="h-4 w-4 text-green-500" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spend': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn': return 'text-green-600';
      case 'spend': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <Trophy className="h-8 w-8 text-yellow-600" />
        <h1 className="text-3xl font-bold">游戏化中心</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="challenges">每日挑战</TabsTrigger>
          <TabsTrigger value="achievements">成就</TabsTrigger>
          <TabsTrigger value="transactions">积分记录</TabsTrigger>
          <TabsTrigger value="leaderboard">排行榜</TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="space-y-6">
          {userPoints && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总积分</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{userPoints.totalPoints}</div>
                  <p className="text-xs text-muted-foreground">
                    可用 {userPoints.availablePoints} 积分
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">等级</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">Lv.{userPoints.level}</div>
                  <p className="text-xs text-muted-foreground">
                    经验 {userPoints.experience}/{userPoints.nextLevelExp}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">已完成成就</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {achievements.filter(a => a.isCompleted).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    共 {achievements.length} 个成就
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日挑战</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {todayChallenge?.completedChallenges || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    共 {todayChallenge?.challenges.length || 0} 个挑战
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 等级进度 */}
          {userPoints && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>等级进度</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lv.{userPoints.level}</span>
                    <span>Lv.{userPoints.level + 1}</span>
                  </div>
                  <Progress 
                    value={(userPoints.experience / userPoints.nextLevelExp) * 100} 
                    className="h-2"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {userPoints.experience} / {userPoints.nextLevelExp} 经验
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 每日挑战 */}
        <TabsContent value="challenges" className="space-y-6">
          {todayChallenge && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>今日挑战</span>
                  <Badge variant="outline">
                    {todayChallenge.completedChallenges}/{todayChallenge.challenges.length} 完成
                  </Badge>
                </CardTitle>
                <CardDescription>
                  完成挑战获得积分奖励，坚持每日挑战提升眼健康！
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayChallenge.challenges.map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {challenge.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                        <h3 className="font-medium">{challenge.title}</h3>
                        <Badge variant={challenge.isCompleted ? 'default' : 'secondary'}>
                          {challenge.points} 积分
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>进度</span>
                        <span>{challenge.current}/{challenge.target} {challenge.unit}</span>
                      </div>
                      <Progress 
                        value={(challenge.current / challenge.target) * 100} 
                        className="h-2"
                      />
                    </div>
                    {!challenge.isCompleted && (
                      <div className="mt-3 flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateChallengeProgress(challenge.id, 1)}
                          disabled={loading}
                        >
                          完成一次
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateChallengeProgress(challenge.id, challenge.target)}
                          disabled={loading}
                        >
                          标记完成
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 成就 */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.isCompleted ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getIcon(achievement.icon)}
                      <span>{achievement.title}</span>
                    </CardTitle>
                    {achievement.isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        已完成
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>进度</span>
                      <span>{achievement.requirements.current}/{achievement.requirements.target} {achievement.requirements.unit}</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">奖励:</p>
                    <div className="flex flex-wrap gap-2">
                      {achievement.rewards.map((reward, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          {getRewardIcon(reward.type)}
                          <span>{reward.description}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {achievement.isCompleted && achievement.completedAt && (
                    <div className="text-sm text-gray-600">
                      完成时间: {new Date(achievement.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 积分记录 */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>积分交易记录</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.reason}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'earn' ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 排行榜 */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>积分排行榜</span>
              </CardTitle>
              <CardDescription>看看谁是最活跃的眼健康守护者</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                        {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <Medal className="h-4 w-4 text-orange-500" />}
                        {index > 2 && <span className="text-sm font-medium">{index + 1}</span>}
                      </div>
                      <div>
                        <p className="font-medium">{entry.name || `用户${entry.userId ? entry.userId.slice(0, 8) : '未知'}`}</p>
                        <p className="text-sm text-gray-500">Lv.{entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{entry.totalPoints}</p>
                      <p className="text-sm text-gray-500">积分</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
