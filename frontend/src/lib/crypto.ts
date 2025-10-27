import CryptoJS from 'crypto-js'

// 加密配置
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES',
  KEY_SIZE: 256,
  IV_SIZE: 16,
  MODE: CryptoJS.mode.CBC,
  PADDING: CryptoJS.pad.Pkcs7,
} as const

/**
 * 生成随机密钥
 */
export function generateKey(): string {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.KEY_SIZE / 8).toString()
}

/**
 * 生成随机IV
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.IV_SIZE).toString()
}

/**
 * 加密数据
 * @param data 要加密的数据
 * @param key 加密密钥
 * @param iv 初始化向量
 * @returns 加密后的数据
 */
export function encrypt(data: string, key: string, iv?: string): string {
  const encryptionKey = CryptoJS.enc.Utf8.parse(key)
  const encryptionIV = iv ? CryptoJS.enc.Utf8.parse(iv) : CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.IV_SIZE)
  
  const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
    iv: encryptionIV,
    mode: ENCRYPTION_CONFIG.MODE,
    padding: ENCRYPTION_CONFIG.PADDING,
  })
  
  return encrypted.toString()
}

/**
 * 解密数据
 * @param encryptedData 加密的数据
 * @param key 解密密钥
 * @param iv 初始化向量
 * @returns 解密后的数据
 */
export function decrypt(encryptedData: string, key: string, iv?: string): string {
  const decryptionKey = CryptoJS.enc.Utf8.parse(key)
  const decryptionIV = iv ? CryptoJS.enc.Utf8.parse(iv) : CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.IV_SIZE)
  
  const decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKey, {
    iv: decryptionIV,
    mode: ENCRYPTION_CONFIG.MODE,
    padding: ENCRYPTION_CONFIG.PADDING,
  })
  
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * 计算文件哈希
 * @param file 文件对象
 * @returns Promise<string> 文件哈希值
 */
export function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
        const hash = CryptoJS.SHA256(wordArray).toString()
        resolve(hash)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 计算字符串哈希
 * @param str 字符串
 * @returns 哈希值
 */
export function calculateStringHash(str: string): string {
  return CryptoJS.SHA256(str).toString()
}

/**
 * 加密文件
 * @param file 文件对象
 * @param key 加密密钥
 * @returns Promise<{encryptedData: string, hash: string}>
 */
export async function encryptFile(file: File, key: string): Promise<{encryptedData: string, hash: string}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string
        const encryptedData = encrypt(fileContent, key)
        const hash = await calculateFileHash(file)
        
        resolve({
          encryptedData,
          hash,
        })
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * 验证文件完整性
 * @param file 文件对象
 * @param expectedHash 期望的哈希值
 * @returns Promise<boolean>
 */
export async function verifyFileIntegrity(file: File, expectedHash: string): Promise<boolean> {
  try {
    const actualHash = await calculateFileHash(file)
    return actualHash === expectedHash
  } catch (error) {
    console.error('文件完整性验证失败:', error)
    return false
  }
}

/**
 * 生成DID标识符
 * @param publicKey 公钥
 * @returns DID标识符
 */
export function generateDID(publicKey: string): string {
  const hash = calculateStringHash(publicKey)
  return `did:eyehealth:${hash.substring(0, 16)}`
}

/**
 * 验证DID格式
 * @param did DID标识符
 * @returns 是否为有效DID
 */
export function validateDID(did: string): boolean {
  const didPattern = /^did:eyehealth:[a-f0-9]{16}$/
  return didPattern.test(did)
}

/**
 * 生成QR码数据
 * @param data 要编码的数据
 * @returns QR码数据字符串
 */
export function generateQRCodeData(data: Record<string, unknown>): string {
  return JSON.stringify({
    type: 'eyehealth_product',
    data,
    timestamp: Date.now(),
    version: '1.0.0',
  })
}

/**
 * 解析QR码数据
 * @param qrData QR码数据字符串
 * @returns 解析后的数据
 */
export function parseQRCodeData(qrData: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(qrData)
    if (parsed.type === 'eyehealth_product') {
      return parsed.data
    }
    throw new Error('无效的QR码格式')
  } catch (error) {
    throw new Error('QR码数据解析失败')
  }
}

