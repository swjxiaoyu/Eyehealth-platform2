'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Trash2, FileText, Image, Archive, Code, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface IPFSFile {
  id: string;
  cid: string;
  filename: string;
  size: number;
  mimeType: string;
  description?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function IPFSPage() {
  const [files, setFiles] = useState<IPFSFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'upload'>('files');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3001/api/v1/ipfs/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        toast.error('获取文件列表失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('请选择文件');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', uploadDescription);

      const response = await fetch('http://localhost:3001/api/v1/ipfs/upload/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`文件上传成功！CID: ${result.cid}`);
        setSelectedFile(null);
        setUploadDescription('');
        fetchFiles();
      } else {
        toast.error('文件上传失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (cid: string, filename: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/api/v1/ipfs/download/${cid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('文件下载成功');
      } else {
        toast.error('文件下载失败');
      }
    } catch (error) {
      toast.error('网络错误');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？此操作不可撤销。')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3001/api/v1/ipfs/file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('文件删除成功');
        fetchFiles(); // 刷新文件列表
      } else {
        toast.error('文件删除失败');
      }
    } catch (error) {
      toast.error('网络错误');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.includes('json')) return <Code className="h-4 w-4" />;
    if (mimeType.includes('text')) return <FileText className="h-4 w-4" />;
    return <Archive className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">IPFS去中心化存储</h1>
        <p className="text-muted-foreground mt-2">
          使用IPFS技术实现去中心化文件存储，确保数据的安全性和可访问性
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'files' ? 'default' : 'outline'}
          onClick={() => setActiveTab('files')}
        >
          <Eye className="h-4 w-4 mr-2" />
          文件列表
        </Button>
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="h-4 w-4 mr-2" />
          上传文件
        </Button>
      </div>

      {/* Files List Tab */}
      {activeTab === 'files' && (
        <Card>
          <CardHeader>
            <CardTitle>IPFS文件列表</CardTitle>
            <CardDescription>
              管理您的IPFS文件，包括下载、固定和删除操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : files.length === 0 ? (
              <Alert>
                <AlertDescription>
                  暂无IPFS文件，请先上传文件
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.mimeType)}
                        <div>
                          <h3 className="font-medium">{file.filename}</h3>
                          <p className="text-sm text-muted-foreground">
                            CID: {file.cid} • {formatFileSize(file.size)} • {file.mimeType}
                          </p>
                          {file.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={file.isPinned ? 'default' : 'secondary'}>
                          {file.isPinned ? '已固定' : '未固定'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(file.cid, file.filename)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>上传文件到IPFS</CardTitle>
            <CardDescription>
              选择文件上传到IPFS去中心化存储网络
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">选择文件</label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">文件描述（可选）</label>
              <Input
                placeholder="输入文件描述"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? '上传中...' : '上传文件'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}