'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  QrCode,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  manufacturerName: string
  qrCode: string
  price?: number | string
  currency?: string
  category?: string
  subcategory?: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
}

interface CartItem {
  product: Product
  quantity: number
}

export default function ProductsPage() {
  const { user, isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
      loadCartFromStorage()
    }
  }, [isAuthenticated, currentPage, searchTerm, filterCategory])

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

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterCategory !== 'all') params.append('category', filterCategory)

      const response = await fetch(`http://localhost:3001/api/v1/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setTotalPages(Math.ceil((data.total || 0) / 10))
      } else {
        toast.error('获取产品列表失败')
      }
    } catch (error) {
      console.error('获取产品失败:', error)
      toast.error('获取产品列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('确定要删除这个产品吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        toast.success('产品删除成功')
        fetchProducts()
      } else {
        toast.error('删除产品失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      toast.error('删除产品失败')
    }
  }

  const handleVerifyProduct = async (productId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/products/${productId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchProducts()
      } else {
        toast.error('验证产品失败')
      }
    } catch (error) {
      console.error('验证产品失败:', error)
      toast.error('验证产品失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatPrice = (price?: number | string, currency?: string) => {
    if (!price) return '价格待定'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '价格待定'
    return `${currency || 'CNY'} ${numPrice.toFixed(2)}`
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>请先登录</CardTitle>
            <CardDescription>您需要登录才能查看产品</CardDescription>
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
              <h1 className="text-2xl font-bold text-gray-900">产品管理</h1>
              <p className="text-gray-600">管理眼健康相关产品</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/products/scan">
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  扫描产品
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" className="relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  购物车
                  {cartItems.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/products/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  添加产品
                </Button>
              </Link>
            </div>
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
                    placeholder="搜索产品..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="筛选分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    <SelectItem value="保健品">保健品</SelectItem>
                    <SelectItem value="医疗器械">医疗器械</SelectItem>
                    <SelectItem value="护眼产品">护眼产品</SelectItem>
                    <SelectItem value="药品">药品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 产品列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无产品</h3>
              <p className="text-gray-600 mb-4">您还没有添加任何产品</p>
              <Link href="/products/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个产品
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <Badge variant={product.isVerified ? 'default' : 'secondary'}>
                            {product.isVerified ? '已验证' : '未验证'}
                          </Badge>
                          <Badge variant={product.isActive ? 'default' : 'outline'}>
                            {product.isActive ? '激活' : '停用'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span>SKU: {product.sku}</span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatPrice(product.price, product.currency)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(product.createdAt)}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>制造商: {product.manufacturerName}</span>
                          {product.category && <span>分类: {product.category}</span>}
                          <span>二维码: {product.qrCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addToCart(product)}
                        className="text-green-600 hover:text-green-700"
                        disabled={!product.isActive || !product.price}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        加入购物车
                      </Button>
                      <Link href={`/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerifyProduct(product.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {product.isVerified ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
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

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

