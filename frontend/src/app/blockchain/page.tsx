'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Link as LinkIcon, 
  Package, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Database,
  Shield
} from 'lucide-react';

interface TraceRecord {
  id: string;
  productId: string;
  stage: string;
  documentHash: string;
  issuer: string;
  issuerName: string;
  location: string;
  coordinates: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  metadata: string;
  certificateUrl: string;
  certificateHash: string;
  isVerified: boolean;
  verificationMethod: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  manufacturerId: string;
  manufacturerName: string;
  qrCode: string;
  barcode: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string;
  specifications: string;
  ingredients: string;
  expiryDate: string;
  batchNumber: string;
  serialNumber: string;
  isActive: boolean;
  isVerified: boolean;
  metadata: string;
  createdAt: string;
  updatedAt: string;
}

interface NetworkInfo {
  channelName: string;
  height: string;
  currentBlockHash: string;
  previousBlockHash: string;
  timestamp: string;
}

export default function BlockchainPage() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchProductId, setSearchProductId] = useState('');
  const [searchSku, setSearchSku] = useState('');

  // 表单状态
  const [traceForm, setTraceForm] = useState({
    productId: '',
    stage: '',
    documentHash: '',
    location: '',
    coordinates: '',
    temperature: '',
    humidity: '',
    metadata: ''
  });

  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    qrCode: '',
    barcode: '',
    price: '',
    currency: 'CNY',
    category: '',
    subcategory: '',
    specifications: '',
    ingredients: '',
    expiryDate: '',
    batchNumber: '',
    serialNumber: ''
  });

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/blockchain/network/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNetworkInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch network info:', error);
    }
  };

  const createTrace = async () => {
    if (!traceForm.productId || !traceForm.stage || !traceForm.documentHash) {
      toast.error('请填写必要字段');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/blockchain/trace', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traceForm),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('溯源记录创建成功');
        setTraceForm({
          productId: '',
          stage: '',
          documentHash: '',
          location: '',
          coordinates: '',
          temperature: '',
          humidity: '',
          metadata: ''
        });
      } else {
        toast.error('创建溯源记录失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    if (!productForm.sku || !productForm.name) {
      toast.error('请填写必要字段');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/blockchain/product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('产品创建成功');
        setProductForm({
          sku: '',
          name: '',
          description: '',
          qrCode: '',
          barcode: '',
          price: '',
          currency: 'CNY',
          category: '',
          subcategory: '',
          specifications: '',
          ingredients: '',
          expiryDate: '',
          batchNumber: '',
          serialNumber: ''
        });
      } else {
        toast.error('创建产品失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const searchTracesByProduct = async () => {
    if (!searchProductId) {
      toast.error('请输入产品ID');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/api/v1/blockchain/trace/product/${searchProductId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTraces(data);
      } else {
        toast.error('查询溯源记录失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const searchProductBySku = async () => {
    if (!searchSku) {
      toast.error('请输入SKU');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/api/v1/blockchain/product/sku/${searchSku}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts([data]);
      } else {
        toast.error('查询产品失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <LinkIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">区块链管理</h1>
      </div>

      {/* 网络信息 */}
      {networkInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>网络状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">通道名称</Label>
                <p className="text-sm text-gray-600">{networkInfo.channelName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">区块高度</Label>
                <p className="text-sm text-gray-600">{networkInfo.height}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">当前区块哈希</Label>
                <p className="text-sm text-gray-600 font-mono">{networkInfo.currentBlockHash.slice(0, 16)}...</p>
              </div>
              <div>
                <Label className="text-sm font-medium">更新时间</Label>
                <p className="text-sm text-gray-600">{new Date(networkInfo.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="trace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trace">溯源管理</TabsTrigger>
          <TabsTrigger value="product">产品管理</TabsTrigger>
          <TabsTrigger value="search">查询功能</TabsTrigger>
        </TabsList>

        {/* 溯源管理 */}
        <TabsContent value="trace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>创建溯源记录</span>
              </CardTitle>
              <CardDescription>
                在区块链上创建产品溯源记录，确保数据不可篡改
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productId">产品ID *</Label>
                  <Input
                    id="productId"
                    value={traceForm.productId}
                    onChange={(e) => setTraceForm({ ...traceForm, productId: e.target.value })}
                    placeholder="输入产品ID"
                  />
                </div>
                <div>
                  <Label htmlFor="stage">阶段 *</Label>
                  <Input
                    id="stage"
                    value={traceForm.stage}
                    onChange={(e) => setTraceForm({ ...traceForm, stage: e.target.value })}
                    placeholder="如：生产、运输、销售"
                  />
                </div>
                <div>
                  <Label htmlFor="documentHash">文档哈希 *</Label>
                  <Input
                    id="documentHash"
                    value={traceForm.documentHash}
                    onChange={(e) => setTraceForm({ ...traceForm, documentHash: e.target.value })}
                    placeholder="相关文档的哈希值"
                  />
                </div>
                <div>
                  <Label htmlFor="location">位置</Label>
                  <Input
                    id="location"
                    value={traceForm.location}
                    onChange={(e) => setTraceForm({ ...traceForm, location: e.target.value })}
                    placeholder="地理位置"
                  />
                </div>
                <div>
                  <Label htmlFor="coordinates">坐标</Label>
                  <Input
                    id="coordinates"
                    value={traceForm.coordinates}
                    onChange={(e) => setTraceForm({ ...traceForm, coordinates: e.target.value })}
                    placeholder="经纬度坐标"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">温度</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={traceForm.temperature}
                    onChange={(e) => setTraceForm({ ...traceForm, temperature: e.target.value })}
                    placeholder="环境温度"
                  />
                </div>
                <div>
                  <Label htmlFor="humidity">湿度</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={traceForm.humidity}
                    onChange={(e) => setTraceForm({ ...traceForm, humidity: e.target.value })}
                    placeholder="环境湿度"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="metadata">元数据</Label>
                <Textarea
                  id="metadata"
                  value={traceForm.metadata}
                  onChange={(e) => setTraceForm({ ...traceForm, metadata: e.target.value })}
                  placeholder="额外的元数据信息"
                  rows={3}
                />
              </div>
              <Button onClick={createTrace} disabled={loading} className="w-full">
                {loading ? '创建中...' : '创建溯源记录'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 产品管理 */}
        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>创建产品</span>
              </CardTitle>
              <CardDescription>
                在区块链上注册新产品，建立产品身份
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="产品SKU"
                  />
                </div>
                <div>
                  <Label htmlFor="name">产品名称 *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="产品名称"
                  />
                </div>
                <div>
                  <Label htmlFor="category">类别</Label>
                  <Input
                    id="category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="产品类别"
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory">子类别</Label>
                  <Input
                    id="subcategory"
                    value={productForm.subcategory}
                    onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                    placeholder="产品子类别"
                  />
                </div>
                <div>
                  <Label htmlFor="price">价格</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="产品价格"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">货币</Label>
                  <Input
                    id="currency"
                    value={productForm.currency}
                    onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })}
                    placeholder="CNY"
                  />
                </div>
                <div>
                  <Label htmlFor="batchNumber">批次号</Label>
                  <Input
                    id="batchNumber"
                    value={productForm.batchNumber}
                    onChange={(e) => setProductForm({ ...productForm, batchNumber: e.target.value })}
                    placeholder="生产批次号"
                  />
                </div>
                <div>
                  <Label htmlFor="serialNumber">序列号</Label>
                  <Input
                    id="serialNumber"
                    value={productForm.serialNumber}
                    onChange={(e) => setProductForm({ ...productForm, serialNumber: e.target.value })}
                    placeholder="产品序列号"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="产品描述"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="specifications">规格</Label>
                <Textarea
                  id="specifications"
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  placeholder="产品规格"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="ingredients">成分</Label>
                <Textarea
                  id="ingredients"
                  value={productForm.ingredients}
                  onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                  placeholder="产品成分"
                  rows={2}
                />
              </div>
              <Button onClick={createProduct} disabled={loading} className="w-full">
                {loading ? '创建中...' : '创建产品'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 查询功能 */}
        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 查询溯源记录 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>查询溯源记录</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="searchProductId">产品ID</Label>
                  <Input
                    id="searchProductId"
                    value={searchProductId}
                    onChange={(e) => setSearchProductId(e.target.value)}
                    placeholder="输入产品ID"
                  />
                </div>
                <Button onClick={searchTracesByProduct} disabled={loading} className="w-full">
                  {loading ? '查询中...' : '查询溯源记录'}
                </Button>
              </CardContent>
            </Card>

            {/* 查询产品 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>查询产品</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="searchSku">SKU</Label>
                  <Input
                    id="searchSku"
                    value={searchSku}
                    onChange={(e) => setSearchSku(e.target.value)}
                    placeholder="输入产品SKU"
                  />
                </div>
                <Button onClick={searchProductBySku} disabled={loading} className="w-full">
                  {loading ? '查询中...' : '查询产品'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 查询结果 */}
          {traces.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>溯源记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {traces.map((trace) => (
                    <div key={trace.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{trace.stage}</h3>
                        <Badge variant={trace.isVerified ? "default" : "secondary"}>
                          {trace.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已验证
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              未验证
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>发布者: {trace.issuerName}</div>
                        <div>位置: {trace.location}</div>
                        <div>温度: {trace.temperature}°C</div>
                        <div>湿度: {trace.humidity}%</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        时间: {new Date(trace.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>产品信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant={product.isVerified ? "default" : "secondary"}>
                          {product.isVerified ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              已验证
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              未验证
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>SKU: {product.sku}</div>
                        <div>类别: {product.category}</div>
                        <div>价格: ¥{product.price}</div>
                        <div>制造商: {product.manufacturerName}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        创建时间: {new Date(product.createdAt).toLocaleString()}
                      </div>
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
