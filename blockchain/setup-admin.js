/**
 * 区块链管理员初始化脚本
 * 用于创建并注册 admin 用户到钱包
 */

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');

    // 创建钱包
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // 检查 admin 是否已存在
    const adminExists = await wallet.get('admin');
    if (adminExists) {
      console.log('Admin user already exists in wallet.');
      console.log('Admin identity:', adminExists);
      return;
    }

    // 检查是否为 admin
    const userExists = await wallet.get('admin');
    if (userExists) {
      console.log('Admin already enrolled');
      return;
    }

    // 加载证书
    const certPath = path.join(__dirname, 'crypto-config', 'peerOrganizations', 
      'org1.example.com', 'users', 'Admin@org1.example.com', 'msp', 'signcerts');
    const keyPath = path.join(__dirname, 'crypto-config', 'peerOrganizations', 
      'org1.example.com', 'users', 'Admin@org1.example.com', 'msp', 'keystore');

    console.log('Cert path:', certPath);
    console.log('Key path:', keyPath);

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      console.error('Crypto configuration not found!');
      console.error('Please run: cd blockchain && ./generate-crypto.bat');
      process.exit(1);
    }

    // 读取证书文件
    const certFiles = fs.readdirSync(certPath);
    const certFile = certFiles.find(f => f.endsWith('-cert.pem'));
    const cert = fs.readFileSync(path.join(certPath, certFile)).toString();

    // 读取私钥文件
    const keyFiles = fs.readdirSync(keyPath);
    const keyFile = keyFiles[0];
    const key = fs.readFileSync(path.join(keyPath, keyFile)).toString();

    // 创建身份
    const identity = {
      credentials: {
        certificate: cert,
        privateKey: key,
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };

    // 保存到钱包
    await wallet.put('admin', identity);
    console.log('Admin identity successfully stored in wallet');
    console.log('Admin user setup completed!');

  } catch (error) {
    console.error(`Failed to setup admin: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

setupAdmin();

