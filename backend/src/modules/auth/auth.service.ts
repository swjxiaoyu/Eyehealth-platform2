import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { WalletLoginDto } from './dto/wallet-login.dto';
import { SignatureService } from './services/signature.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private signatureService: SignatureService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('无效的凭据');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        did: user.did,
        isVerified: user.isVerified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('邮箱已被注册');
    }

    const saltRounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'), 10);
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      dob: registerDto.dob,
      isActive: true,
      isVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const payload = { email: savedUser.email, sub: savedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        did: savedUser.did,
        isVerified: savedUser.isVerified,
      },
    };
  }

  async getWalletMessage(walletAddress: string) {
    const message = this.signatureService.generateMessage(walletAddress);
    const nonce = this.signatureService.generateNonce();
    
    return {
      message,
      nonce,
      walletAddress,
    };
  }

  async walletLogin(walletLoginDto: WalletLoginDto) {
    const { walletAddress, signature, message } = walletLoginDto;

    // 如果提供了签名，验证签名
    if (signature && message) {
      const isValidSignature = this.signatureService.verifySignature(
        message,
        signature,
        walletAddress
      );

      if (!isValidSignature) {
        throw new UnauthorizedException('无效的签名');
      }
    }

    let user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      // 创建新用户
      user = this.userRepository.create({
        walletAddress,
        did: this.generateDID(walletAddress),
        email: `${walletAddress.toLowerCase()}@wallet.local`, // 为钱包用户生成虚拟邮箱
        name: `Wallet User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, // 生成默认名称
        isActive: true,
        isVerified: true,
      });

      user = await this.userRepository.save(user);
    }

    const payload = { walletAddress: user.walletAddress, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        did: user.did,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newPayload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async logout(userId: string) {
    // 在实际应用中，这里应该将token加入黑名单
    // 或者使用Redis存储已撤销的token
    return { message: '登出成功' };
  }

  private generateDID(walletAddress: string): string {
    // 简单的DID生成逻辑，实际应用中应该使用更复杂的算法
    const hash = require('crypto').createHash('sha256').update(walletAddress).digest('hex');
    return `did:eyehealth:${hash.substring(0, 16)}`;
  }
}
