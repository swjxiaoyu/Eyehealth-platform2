'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, MapPin, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  name: string
  price: number | string
  description: string
  category: string
  sku?: string
}

interface CartItem {
  product: Product
  quantity: number
}

const PAYMENT_METHODS = [
  { value: 'credit_card', label: '信用卡' },
  { value: 'debit_card', label: '借记卡' },
  { value: 'bank_transfer', label: '银行转账' },
  { value: 'crypto', label: '加密货币' },
  { value: 'wallet', label: '数字钱包' },
]

export default function CartPage() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    fetchProducts()
    loadCartFromStorage()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || data)
      }
    } catch (error) {
      console.error('获取产品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }

  const saveCartToStorage = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items))
  }

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      let newItems: CartItem[]
      
      if (existingItem) {
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...prev, { product, quantity: 1 }]
      }
      
      saveCartToStorage(newItems)
      return newItems
    })
    toast.success('已添加到购物车')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
      saveCartToStorage(newItems)
      return newItems
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId)
      saveCartToStorage(newItems)
      return newItems
    })
    toast.success('已从购物车移除')
  }

  const clearCart = () => {
    setCartItems([])
    saveCartToStorage([])
    toast.success('购物车已清空')
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.product.price.toString()) * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (cartItems.length === 0) {
      toast.error('购物车为空')
      return
    }

    if (!shippingAddress.trim()) {
      toast.error('请填写配送地址')
      return
    }

    if (!paymentMethod) {
      toast.error('请选择支付方式')
      return
    }

    setCheckoutLoading(true)

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        shippingAddress: shippingAddress.trim(),
        billingAddress: billingAddress.trim() || shippingAddress.trim(),
      }

      const response = await fetch('http://localhost:3001/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        toast.success('订单创建成功！')
        
        // 清空购物车
        clearCart()
        
        // 跳转到订单页面
        window.location.href = '/orders'
      } else {
        const error = await response.json()
        toast.error(error.message || '创建订单失败')
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      toast.error('网络连接失败')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShoppingCart className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>加载中...</p>
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
            购物车
          </h1>
          <p className="text-gray-600">管理您的购物车和结账</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 购物车商品 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>购物车商品</span>
                  <Badge variant="secondary">
                    {getTotalItems()} 件商品
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">购物车为空</h3>
                    <p className="text-gray-600 mb-4">添加一些商品到购物车</p>
                    <Button onClick={() => window.location.href = '/products'}>
                      去购买商品
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">{item.product.description}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product.sku || 'N/A'}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">
                            ¥{(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ¥{parseFloat(item.product.price.toString()).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button variant="outline" onClick={clearCart}>
                        清空购物车
                      </Button>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          总计: ¥{getTotalPrice().toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 结账信息 */}
          <div className="space-y-6">
            {/* 配送信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  配送信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shipping-address">配送地址 *</Label>
                  <Textarea
                    id="shipping-address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="请输入详细的配送地址..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="billing-address">账单地址</Label>
                  <Textarea
                    id="billing-address"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="如与配送地址相同，可留空..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 支付方式 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  支付方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="payment-method">选择支付方式 *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择支付方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 订单摘要 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  订单摘要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>商品数量:</span>
                    <span>{getTotalItems()} 件</span>
                  </div>
                  <div className="flex justify-between">
                    <span>商品总价:</span>
                    <span>¥{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>配送费:</span>
                    <span>¥0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>总计:</span>
                    <span>¥{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                >
                  {checkoutLoading ? '处理中...' : '立即结账'}
                </Button>
                
                <Alert className="mt-4">
                  <AlertDescription>
                    这是演示环境，订单将模拟创建成功
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 推荐商品 */}
        {products.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>推荐商品</CardTitle>
              <CardDescription>您可能感兴趣的商品</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">¥{parseFloat(product.price.toString()).toFixed(2)}</span>
                      <Button 
                        size="sm" 
                        onClick={() => addToCart(product)}
                      >
                        加入购物车
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
