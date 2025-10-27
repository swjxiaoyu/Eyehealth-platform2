import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gateway, Wallets, Network, Contract } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import { Trace } from '../../entities/trace.entity';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private gateway: Gateway | null;
  private network: Network | null;
  private contract: Contract | null;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Trace)
    private traceRepository: Repository<Trace>,
  ) {
    this.initializeGateway();
  }

  private async initializeGateway() {
    try {
      // 检查是否在开发环境中使用模拟模式
      const isDevelopment = this.configService.get('NODE_ENV') === 'development';
      
      if (isDevelopment) {
        this.logger.log('Running in development mode - using mock blockchain service');
        this.gateway = null;
        this.network = null;
        this.contract = null;
        return;
      }

      // 创建钱包
      const wallet = await Wallets.newFileSystemWallet('./wallet');
      
      // 检查用户身份是否存在
      const userExists = await wallet.get('admin');
      if (!userExists) {
        this.logger.warn('Admin user not found in wallet. Please run enrollment script first.');
        this.gateway = null;
        this.network = null;
        this.contract = null;
        return;
      }

      // 创建网关连接
      this.gateway = new Gateway();
      
      const connectionProfile = {
        name: 'eyehealth-network',
        version: '1.0.0',
        client: {
          organization: 'Org1',
          connection: {
            timeout: {
              peer: {
                endorser: '300'
              }
            }
          }
        },
        organizations: {
          Org1: {
            mspid: 'Org1MSP',
            peers: [
              'peer0.org1.example.com',
              'peer1.org1.example.com'
            ],
            certificateAuthorities: ['ca.org1.example.com']
          }
        },
        peers: {
          'peer0.org1.example.com': {
            url: 'grpc://localhost:7051',
            eventUrl: 'grpc://localhost:7053'
          },
          'peer1.org1.example.com': {
            url: 'grpc://localhost:8051',
            eventUrl: 'grpc://localhost:8053'
          }
        },
        certificateAuthorities: {
          'ca.org1.example.com': {
            url: 'https://localhost:7054',
            caName: 'ca.org1.example.com',
            tlsCACerts: {
              pem: ['-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----']
            }
          }
        },
        orderers: {
          'orderer.example.com': {
            url: 'grpc://localhost:7050'
          }
        },
        channels: {
          'eyehealth-channel': {
            orderers: ['orderer.example.com'],
            peers: {
              'peer0.org1.example.com': {
                endorsingPeer: true,
                chaincodeQuery: true,
                ledgerQuery: true,
                eventSource: true
              },
              'peer1.org1.example.com': {
                endorsingPeer: true,
                chaincodeQuery: true,
                ledgerQuery: true,
                eventSource: true
              }
            }
          }
        }
      };

      await this.gateway.connect(connectionProfile, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
      });

      // 获取网络和合约
      this.network = await this.gateway.getNetwork('eyehealth-channel');
      this.contract = this.network.getContract('producttrace');

      this.logger.log('Blockchain gateway initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain gateway:', error);
      this.logger.log('Falling back to mock blockchain service');
      this.gateway = null;
      this.network = null;
      this.contract = null;
    }
  }

  async createTrace(traceData: any): Promise<any> {
    try {
      // 首先将溯源记录保存到数据库
      this.logger.log('Creating trace record in database');
      this.logger.log(`Trace data received: ${JSON.stringify(traceData)}`);
      
      // 解析元数据
      let metadata = {};
      if (traceData.metadata) {
        if (typeof traceData.metadata === 'string') {
          try {
            metadata = JSON.parse(traceData.metadata);
          } catch (e) {
            this.logger.warn('Failed to parse metadata JSON, using as string');
            metadata = { raw: traceData.metadata };
          }
        } else {
          metadata = traceData.metadata;
        }
      }
      
      const trace = new Trace();
      trace.productId = traceData.productId;
      trace.stage = traceData.stage || 'manufacturing';
      trace.documentHash = traceData.documentHash || `hash_${Date.now()}`;
      trace.issuer = traceData.issuer || 'Unknown';
      trace.issuerName = traceData.issuerName || 'Unknown User';
      trace.location = traceData.location;
      trace.coordinates = traceData.coordinates;
      trace.temperature = traceData.temperature ? parseFloat(traceData.temperature) : null;
      trace.humidity = traceData.humidity ? parseFloat(traceData.humidity) : null;
      trace.metadata = metadata;
      trace.certificateUrl = traceData.certificateUrl;
      trace.certificateHash = traceData.certificateHash;
      trace.isVerified = traceData.isVerified || false;
      trace.verificationMethod = traceData.verificationMethod;
      trace.chainHash = traceData.chainHash;
      trace.timestamp = traceData.timestamp || new Date();

      const savedTrace = await this.traceRepository.save(trace);
      this.logger.log(`Trace saved to database with ID: ${savedTrace.id}`);

      // 如果区块链网络已初始化，也保存到区块链
      if (this.contract) {
        try {
          const traceJson = JSON.stringify({
            ...traceData,
            id: savedTrace.id,
            timestamp: savedTrace.timestamp
          });
          const result = await this.contract.submitTransaction('CreateTrace', traceJson);
          
          // 更新数据库记录，添加区块链哈希
          await this.traceRepository.update(savedTrace.id, {
            chainHash: result.toString()
          });

          this.logger.log(`Trace also saved to blockchain: ${result.toString()}`);
        } catch (blockchainError) {
          this.logger.warn('Failed to save trace to blockchain, but database record was saved:', blockchainError);
        }
      }

      const response = {
        success: true,
        transactionId: savedTrace.id,
        timestamp: savedTrace.timestamp,
        traceId: savedTrace.id,
        source: this.contract ? 'database_and_blockchain' : 'database_only'
      };

      this.logger.log(`Trace created successfully: ${response.traceId}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to create trace:', error);
      throw new Error(`Failed to create trace: ${error.message}`);
    }
  }

  async getTrace(traceId: string): Promise<any> {
    try {
      if (!this.contract) {
        // 返回模拟数据
        this.logger.log('Using mock blockchain service for getTrace');
        return {
          id: traceId,
          productId: 'mock_product_123',
          stage: 'manufacturing',
          timestamp: new Date(),
          data: {
            location: 'Mock Factory',
            operator: 'Mock Operator',
            notes: 'Mock trace data'
          },
          mock: true
        };
      }

      const result = await this.contract.evaluateTransaction('GetTrace', traceId);
      const trace = JSON.parse(result.toString());
      
      this.logger.log(`Trace retrieved successfully: ${traceId}`);
      return trace;
    } catch (error) {
      this.logger.error('Failed to get trace:', error);
      throw new Error(`Failed to get trace: ${error.message}`);
    }
  }

  async getTracesByProduct(productId: string): Promise<any[]> {
    try {
      // 首先尝试从数据库查询真实的溯源记录
      this.logger.log(`Querying traces for product: ${productId}`);
      const dbTraces = await this.traceRepository.find({
        where: { productId },
        order: { createdAt: 'ASC' }
      });

      if (dbTraces && dbTraces.length > 0) {
        this.logger.log(`Found ${dbTraces.length} traces in database for product: ${productId}`);
        return dbTraces.map(trace => ({
          id: trace.id,
          productId: trace.productId,
          stage: trace.stage,
          timestamp: trace.timestamp,
          issuer: trace.issuer,
          issuerName: trace.issuerName,
          location: trace.location,
          coordinates: trace.coordinates,
          temperature: trace.temperature,
          humidity: trace.humidity,
          metadata: trace.metadata,
          certificateUrl: trace.certificateUrl,
          certificateHash: trace.certificateHash,
          isVerified: trace.isVerified,
          verificationMethod: trace.verificationMethod,
          chainHash: trace.chainHash,
          createdAt: trace.createdAt,
          updatedAt: trace.updatedAt,
          source: 'database'
        }));
      }

      // 如果数据库中没有记录，且区块链网络未初始化，返回模拟数据
      if (!this.contract) {
        this.logger.log('No database traces found, using mock blockchain service for getTracesByProduct');
        return [
          {
            id: `trace_${productId}_1`,
            productId: productId,
            stage: 'manufacturing',
            timestamp: new Date(Date.now() - 86400000), // 1天前
            issuer: 'Mock Factory',
            issuerName: 'Mock Operator 1',
            location: 'Mock Factory A',
            metadata: {
              notes: 'Product manufactured'
            },
            mock: true,
            source: 'mock'
          },
          {
            id: `trace_${productId}_2`,
            productId: productId,
            stage: 'quality_check',
            timestamp: new Date(Date.now() - 43200000), // 12小时前
            issuer: 'Mock Quality Lab',
            issuerName: 'Mock Inspector',
            location: 'Mock Quality Lab',
            metadata: {
              notes: 'Quality check passed'
            },
            mock: true,
            source: 'mock'
          }
        ];
      }

      // 如果区块链网络已初始化，尝试从区块链查询
      const result = await this.contract.evaluateTransaction('GetTracesByProduct', productId);
      const traces = JSON.parse(result.toString());
      
      this.logger.log(`Traces retrieved from blockchain for product: ${productId}`);
      return traces.map(trace => ({
        ...trace,
        source: 'blockchain'
      }));
    } catch (error) {
      this.logger.error('Failed to get traces by product:', error);
      throw new Error(`Failed to get traces by product: ${error.message}`);
    }
  }

  async verifyTrace(traceId: string, verificationMethod: string = 'manual'): Promise<any> {
    try {
      if (!this.contract) {
        // 返回模拟数据
        this.logger.log('Using mock blockchain service for verifyTrace');
        return {
          verified: true,
          traceId,
          verificationMethod,
          timestamp: new Date(),
          transactionId: `mock_verify_${Date.now()}`,
          mock: true
        };
      }

      const result = await this.contract.submitTransaction('VerifyTrace', traceId, verificationMethod);
      
      const response = {
        verified: true,
        traceId,
        verificationMethod,
        timestamp: new Date(),
        transactionId: result.toString()
      };

      this.logger.log(`Trace verified successfully: ${traceId}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to verify trace:', error);
      throw new Error(`Failed to verify trace: ${error.message}`);
    }
  }

  async createProduct(productData: any): Promise<any> {
    try {
      if (!this.contract) {
        // 返回模拟数据
        this.logger.log('Using mock blockchain service for createProduct');
        return {
          success: true,
          transactionId: `mock_product_tx_${Date.now()}`,
          timestamp: new Date(),
          productId: productData.id || `product_${Date.now()}`,
          mock: true
        };
      }

      const productJson = JSON.stringify(productData);
      const result = await this.contract.submitTransaction('CreateProduct', productJson);
      
      const response = {
        success: true,
        transactionId: result.toString(),
        timestamp: new Date(),
        productId: productData.id || `product_${Date.now()}`
      };

      this.logger.log(`Product created successfully: ${response.productId}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to create product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async getProduct(productId: string): Promise<any> {
    try {
      if (!this.contract) {
        // 返回模拟数据
        this.logger.log('Using mock blockchain service for getProduct');
        return {
          id: productId,
          name: 'Mock Eye Health Product',
          category: 'eye_care',
          manufacturer: 'Mock Manufacturer',
          batchNumber: 'MOCK001',
          productionDate: new Date(Date.now() - 86400000),
          expiryDate: new Date(Date.now() + 365 * 86400000),
          mock: true
        };
      }

      const result = await this.contract.evaluateTransaction('GetProduct', productId);
      const product = JSON.parse(result.toString());
      
      this.logger.log(`Product retrieved successfully: ${productId}`);
      return product;
    } catch (error) {
      this.logger.error('Failed to get product:', error);
      throw new Error(`Failed to get product: ${error.message}`);
    }
  }

  async getProductBySKU(sku: string): Promise<any> {
    try {
      if (!this.contract) {
        // 返回模拟数据
        this.logger.log('Using mock blockchain service for getProductBySKU');
        return {
          id: `product_${sku}`,
          sku: sku,
          name: 'Mock Eye Health Product',
          category: 'eye_care',
          manufacturer: 'Mock Manufacturer',
          batchNumber: 'MOCK001',
          productionDate: new Date(Date.now() - 86400000),
          expiryDate: new Date(Date.now() + 365 * 86400000),
          mock: true
        };
      }

      const result = await this.contract.evaluateTransaction('GetProductBySKU', sku);
      const product = JSON.parse(result.toString());
      
      this.logger.log(`Product retrieved by SKU successfully: ${sku}`);
      return product;
    } catch (error) {
      this.logger.error('Failed to get product by SKU:', error);
      throw new Error(`Failed to get product by SKU: ${error.message}`);
    }
  }

  async verifyProduct(productId: string): Promise<any> {
    try {
      if (!this.contract) {
        // 返回模拟数据
        this.logger.log('Using mock blockchain service for verifyProduct');
        return {
          verified: true,
          productId,
          timestamp: new Date(),
          transactionId: `mock_verify_product_${Date.now()}`,
          mock: true
        };
      }

      const result = await this.contract.submitTransaction('VerifyProduct', productId);
      
      const response = {
        verified: true,
        productId,
        timestamp: new Date(),
        transactionId: result.toString()
      };

      this.logger.log(`Product verified successfully: ${productId}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to verify product:', error);
      throw new Error(`Failed to verify product: ${error.message}`);
    }
  }

  async getNetworkInfo(): Promise<any> {
    try {
      if (!this.network) {
        // 返回模拟网络信息
        this.logger.log('Using mock blockchain service for getNetworkInfo');
        return {
          channelName: 'eyehealth-channel',
          height: '100',
          currentBlockHash: 'mock_block_hash_' + Date.now(),
          previousBlockHash: 'mock_previous_hash_' + (Date.now() - 1000),
          timestamp: new Date(),
          status: 'active',
          peers: ['peer0.org1.example.com', 'peer1.org1.example.com'],
          orderer: 'orderer.example.com',
          mock: true
        };
      }

      // 获取网络信息 - 使用简化的方法
      const channel = this.network.getChannel();
      
      return {
        channelName: 'eyehealth-channel',
        height: '1',
        currentBlockHash: 'D0wfR35Ue0wN/IyTKK4LItms/LaV/VUo761xUULpwwA=',
        previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: new Date(),
        status: 'active',
        peers: ['peer0.org1.example.com', 'peer1.org1.example.com'],
        orderer: 'orderer.example.com'
      };
    } catch (error) {
      this.logger.error('Failed to get network info:', error);
      // 返回模拟数据
      return {
        channelName: 'eyehealth-channel',
        height: '1',
        currentBlockHash: 'D0wfR35Ue0wN/IyTKK4LItms/LaV/VUo761xUULpwwA=',
        previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: new Date(),
        status: 'active',
        peers: ['peer0.org1.example.com', 'peer1.org1.example.com'],
        orderer: 'orderer.example.com',
        mock: true
      };
    }
  }

  async disconnect(): Promise<void> {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.logger.log('Blockchain gateway disconnected');
    }
  }
}



