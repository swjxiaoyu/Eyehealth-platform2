import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Trace } from '../../entities/trace.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Trace)
    private traceRepository: Repository<Trace>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 检查SKU是否已存在
    const existingSku = await this.productRepository.findOne({
      where: { sku: createProductDto.sku }
    });
    if (existingSku) {
      throw new ConflictException('SKU已存在');
    }

    // 检查二维码是否已存在
    const existingQrCode = await this.productRepository.findOne({
      where: { qrCode: createProductDto.qrCode }
    });
    if (existingQrCode) {
      throw new ConflictException('二维码已存在');
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { sku } });
  }

  async findByQrCode(qrCode: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { qrCode } });
  }

  async findAll(options: FindAllOptions = {}): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, category, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 检查SKU是否与其他产品冲突
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: updateProductDto.name }
      });
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException('产品名称已存在');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    await this.productRepository.remove(product);
  }

  async verifyProduct(id: string): Promise<{ verified: boolean; message: string }> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 这里可以添加更复杂的验证逻辑
    // 比如检查区块链记录、验证制造商信息等
    const isVerified = product.isVerified && product.isActive;
    
    return {
      verified: isVerified,
      message: isVerified ? '产品验证通过' : '产品验证失败'
    };
  }

  async getTraceRecords(productId: string): Promise<any[]> {
    return this.traceRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' }
    });
  }

  async getProductTraceability(id: string): Promise<any> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 获取溯源记录
    const traces = await this.getTraceRecords(id);

    return {
      product,
      traces,
      blockchainHash: product.metadata?.blockchainHash || null,
      verificationStatus: product.isVerified,
    };
  }
}
