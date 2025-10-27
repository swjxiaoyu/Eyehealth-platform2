'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestPage() {
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testRegister = async () => {
    setIsLoading(true)
    setResult('测试中...')
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test' + Date.now() + '@example.com',
          name: 'Test User',
          password: 'password123',
          dob: '1990-01-01'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult('✅ 注册成功: ' + JSON.stringify(data, null, 2))
      } else {
        setResult('❌ 注册失败: ' + JSON.stringify(data, null, 2))
      }
    } catch (error) {
      setResult('❌ 网络错误: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>API 测试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testRegister} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '测试中...' : '测试注册API'}
          </Button>
          
          {result && (
            <div className="mt-4">
              <Label>测试结果:</Label>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





