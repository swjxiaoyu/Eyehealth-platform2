'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingCart, Package, CreditCard, Truck, CheckCircle, XCircle, RefreshCw, Eye, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  sku: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  amount: number
  currency: string
  paymentMethod: string
  items: OrderItem[]
  shippingAddress: string
  trackingNumber?: string
  estimatedDelivery?: string
  actualDelivery?: string
  createdAt: string
  updatedAt: string
}

interface PaymentMethod {
  value: string
  label: string
}

const ORDER_STATUS: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: '已支付', color: 'bg-blue-100 text-blue-800', icon: CreditCard },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800', icon: RefreshCw },
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { value: 'credit_card', label: '信用卡' },
  { value: 'debit_card', label: '借记卡' },
  { value: 'bank_transfer', label: '银行转账' },
  { value: 'crypto', label: '加密货币' },
  { value: 'wallet', label: '数字钱包' },
]

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, page])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/orders?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setTotal(data.total)
      } else {
        toast.error('获取订单列表失败')
      }
    } catch (error) {
      console.error('获取订单失败:', error)
      toast.error('网络连接失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (order: Order) => {
    setSelectedOrder(order)
    setShowPaymentDialog(true)
  }

  const processPayment = async () => {
    if (!selectedOrder) return

    try {
      const paymentData = {
        method: selectedOrder.paymentMethod,
        amount: selectedOrder.amount,
        currency: selectedOrder.currency,
      }

      const response = await fetch(`http://localhost:3001/api/v1/orders/${selectedOrder.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ paymentData: JSON.stringify(paymentData) }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('支付成功！')
          setShowPaymentDialog(false)
          fetchOrders()
        } else {
          toast.error(result.error || '支付失败')
        }
      } else {
        toast.error('支付处理失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      toast.error('网络连接失败')
    }
  }

  const handleRefund = async (order: Order) => {
    setSelectedOrder(order)
    setShowRefundDialog(true)
  }

  const processRefund = async () => {
    if (!selectedOrder || !refundReason) return

    try {
      const response = await fetch(`http://localhost:3001/api/v1/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ reason: refundReason }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('退款申请已提交！')
          setShowRefundDialog(false)
          setRefundReason('')
          fetchOrders()
        } else {
          toast.error(result.error || '退款失败')
        }
      } else {
        toast.error('退款处理失败')
      }
    } catch (error) {
      console.error('退款失败:', error)
      toast.error('网络连接失败')
    }
  }

  const handleCancel = async (order: Order) => {
    if (!confirm('确定要取消这个订单吗？')) return

    try {
      const response = await fetch(`http://localhost:3001/api/v1/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ reason: '用户主动取消' }),
      })

      if (response.ok) {
        toast.success('订单已取消')
        fetchOrders()
      } else {
        toast.error('取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      toast.error('网络连接失败')
    }
  }

  const getStatusInfo = (status: string) => {
    return ORDER_STATUS[status] || ORDER_STATUS.pending
  }

  const canPay = (order: Order) => {
    return order.status === 'pending'
  }

  const canCancel = (order: Order) => {
    return order.status === 'pending' || order.status === 'paid'
  }

  const canRefund = (order: Order) => {
    return order.status === 'paid' || order.status === 'shipped'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatCurrency = (amount: number, currency: string = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>加载订单中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            订单管理
          </h1>
          <p className="text-gray-600">管理您的所有订单</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
              <p className="text-gray-600 mb-4">您还没有任何订单</p>
              <Button onClick={() => window.location.href = '/products'}>
                去购买产品
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {order.orderNumber}
                        </CardTitle>
                        <CardDescription>
                          创建时间: {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">订单金额</p>
                        <p className="text-lg font-semibold">{formatCurrency(order.amount, order.currency)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">支付方式</p>
                        <p className="text-sm">{PAYMENT_METHODS.find(p => p.value === order.paymentMethod)?.label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">商品数量</p>
                        <p className="text-sm">{order.items.reduce((sum, item) => sum + item.quantity, 0)} 件</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">配送地址</p>
                        <p className="text-sm truncate">{order.shippingAddress}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">商品清单:</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <div>
                              <p className="text-sm font-medium">{item.productName}</p>
                              <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">数量: {item.quantity}</p>
                              <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <Alert className="mb-4">
                        <Truck className="h-4 w-4" />
                        <AlertDescription>
                          <strong>物流跟踪:</strong> {order.trackingNumber}
                          {order.estimatedDelivery && (
                            <span className="ml-2">
                              预计送达: {formatDate(order.estimatedDelivery)}
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {canPay(order) && (
                        <Button onClick={() => handlePayment(order)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          立即支付
                        </Button>
                      )}
                      
                      {canCancel(order) && (
                        <Button variant="outline" onClick={() => handleCancel(order)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          取消订单
                        </Button>
                      )}
                      
                      {canRefund(order) && (
                        <Button variant="outline" onClick={() => handleRefund(order)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          申请退款
                        </Button>
                      )}
                      
                      <Button variant="ghost" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* 分页 */}
            {total > 10 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4">
                  第 {page} 页，共 {Math.ceil(total / 10)} 页
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(total / 10)}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 支付对话框 */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>订单支付</DialogTitle>
              <DialogDescription>
                订单号: {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">
                  支付金额: {selectedOrder && formatCurrency(selectedOrder.amount, selectedOrder.currency)}
                </p>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  这是演示环境，支付将模拟成功
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={processPayment} className="flex-1">
                  确认支付
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 退款对话框 */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>申请退款</DialogTitle>
              <DialogDescription>
                订单号: {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="refund-reason">退款原因</Label>
                <Textarea
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="请说明退款原因..."
                  rows={3}
                />
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  退款申请提交后将由系统自动处理
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button 
                  onClick={processRefund} 
                  className="flex-1"
                  disabled={!refundReason.trim()}
                >
                  提交退款申请
                </Button>
                <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 订单详情对话框 */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>订单详情</DialogTitle>
              <DialogDescription>
                订单号: {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">订单状态</p>
                    <Badge className={getStatusInfo(selectedOrder.status).color}>
                      {getStatusInfo(selectedOrder.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">订单金额</p>
                    <p className="font-semibold">{formatCurrency(selectedOrder.amount, selectedOrder.currency)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">配送地址</p>
                  <p className="text-sm">{selectedOrder.shippingAddress}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">商品清单</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">数量: {item.quantity}</p>
                          <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">创建时间</p>
                    <p>{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">更新时间</p>
                    <p>{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
