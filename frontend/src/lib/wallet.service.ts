import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
}

export interface SignatureResult {
  message: string;
  signature: string;
  address: string;
}

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * 检查是否安装了MetaMask
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * 连接钱包
   */
  async connectWallet(): Promise<WalletInfo> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('请安装MetaMask钱包');
    }

    try {
      // 请求连接钱包
      this.provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      await this.provider.send('eth_requestAccounts', []);
      
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      };
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw new Error('连接钱包失败，请重试');
    }
  }

  /**
   * 获取当前连接的钱包信息
   */
  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!this.signer) {
      return null;
    }

    try {
      const address = await this.signer.getAddress();
      const network = await this.provider!.getNetwork();
      const balance = await this.provider!.getBalance(address);

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      };
    } catch (error) {
      console.error('获取钱包信息失败:', error);
      return null;
    }
  }

  /**
   * 签名消息
   */
  async signMessage(message: string): Promise<SignatureResult> {
    if (!this.signer) {
      throw new Error('请先连接钱包');
    }

    try {
      const address = await this.signer.getAddress();
      const signature = await this.signer.signMessage(message);

      return {
        message,
        signature,
        address,
      };
    } catch (error) {
      console.error('签名失败:', error);
      throw new Error('签名失败，请重试');
    }
  }

  /**
   * 断开钱包连接
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  /**
   * 监听账户变化
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.isMetaMaskInstalled()) {
      window.ethereum!.on('accountsChanged', (accounts: unknown) => {
        callback(accounts as string[]);
      });
    }
  }

  /**
   * 监听链变化
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (this.isMetaMaskInstalled()) {
      window.ethereum!.on('chainChanged', (chainId: unknown) => {
        callback(chainId as string);
      });
    }
  }

  /**
   * 移除事件监听器
   */
  removeAllListeners(): void {
    if (this.isMetaMaskInstalled()) {
      window.ethereum!.removeAllListeners('accountsChanged');
      window.ethereum!.removeAllListeners('chainChanged');
    }
  }
}

// 创建单例实例
export const walletService = new WalletService();

// 扩展Window接口以支持ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}
