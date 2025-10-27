// 测试溯源记录创建和查询功能
const testTraceFunctionality = async () => {
  const baseUrl = 'http://localhost:3001/api/v1';
  
  // 首先登录获取token
  console.log('🔐 正在登录...');
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ 登录失败');
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.access_token;
  console.log('✅ 登录成功');

  // 创建一个测试产品
  console.log('\n📦 创建测试产品...');
  const productData = {
    name: '测试眼药水',
    sku: 'TEST_EYE_DROP_001',
    qrCode: 'QR_TEST_001',
    barcode: '1234567890123',
    price: 29.99,
    currency: 'CNY',
    category: '眼药水',
    subcategory: '缓解疲劳',
    specifications: '10ml',
    ingredients: ['玻璃酸钠'], // 改为数组格式
    expiryDate: '2025-12-31',
    batchNumber: 'BATCH_001',
    serialNumber: 'SN_001',
    manufacturerId: 'MANUFACTURER_001', // 添加制造商ID
    manufacturerName: '测试制药公司' // 添加制造商名称
  };

  const productResponse = await fetch(`${baseUrl}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!productResponse.ok) {
    const errorText = await productResponse.text();
    console.error(`❌ 创建产品失败: ${productResponse.status} ${productResponse.statusText}`);
    console.error(`错误详情: ${errorText}`);
    return;
  }

  const product = await productResponse.json();
  console.log(`✅ 产品创建成功，ID: ${product.id}`);

  // 创建溯源记录
  console.log('\n🔗 创建溯源记录...');
  const traceData = {
    productId: product.id,
    stage: 'manufacturing',
    location: '北京工厂',
    coordinates: '39.9042,116.4074',
    temperature: 22.5,
    humidity: 45.0,
    metadata: {
      operator: '张三',
      equipment: '生产线A',
      notes: '产品生产完成，质量检测通过'
    },
    certificateUrl: 'https://example.com/cert/001',
    certificateHash: 'cert_hash_001'
  };

  const traceResponse = await fetch(`${baseUrl}/blockchain/trace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(traceData)
  });

  if (!traceResponse.ok) {
    const errorText = await traceResponse.text();
    console.error(`❌ 创建溯源记录失败: ${traceResponse.status} ${traceResponse.statusText}`);
    console.error(`错误详情: ${errorText}`);
    return;
  }

  const trace = await traceResponse.json();
  console.log(`✅ 溯源记录创建成功，ID: ${trace.traceId}`);

  // 等待一下让数据库更新
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 查询溯源记录
  console.log('\n🔍 查询溯源记录...');
  const queryResponse = await fetch(`${baseUrl}/blockchain/trace/product/${product.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!queryResponse.ok) {
    console.error('❌ 查询溯源记录失败');
    return;
  }

  const traces = await queryResponse.json();
  console.log(`✅ 查询成功，找到 ${traces.length} 条溯源记录:`);
  
  traces.forEach((trace, index) => {
    console.log(`\n记录 ${index + 1}:`);
    console.log(`  ID: ${trace.id}`);
    console.log(`  阶段: ${trace.stage}`);
    console.log(`  位置: ${trace.location}`);
    console.log(`  发行者: ${trace.issuerName}`);
    console.log(`  时间: ${new Date(trace.timestamp).toLocaleString()}`);
    console.log(`  来源: ${trace.source || 'unknown'}`);
    if (trace.metadata) {
      console.log(`  元数据: ${JSON.stringify(trace.metadata)}`);
    }
  });

  console.log('\n🎉 测试完成！');
};

// 运行测试
testTraceFunctionality().catch(console.error);
