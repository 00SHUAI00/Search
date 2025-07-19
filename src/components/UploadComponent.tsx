'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatFileSize } from '../lib/utils';

interface UploadComponentProps {
  onUploadSuccess: () => void;
}

export default function UploadComponent({ onUploadSuccess }: UploadComponentProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files);
    setUploadStatus(null);
  }, []);

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadStatus({ success: false, message: '请选择要上传的文件' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        formData.append('files', file);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({ success: true, message: `成功上传 ${selectedFiles.length} 个文件` });
        setSelectedFiles(null);
        // 重置文件输入
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        onUploadSuccess();
      } else {
        setUploadStatus({ success: false, message: result.error || '上传失败' });
      }
    } catch (error) {
      setUploadStatus({ success: false, message: '上传失败，请重试' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>文档上传</CardTitle>
        <CardDescription>
          支持上传 PDF、Word 和文本文件。系统将自动解析文档内容并建立搜索索引。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">选中的文件:</h4>
            <ul className="space-y-1">
              {Array.from(selectedFiles).map((file, index) => {
                const f = file as File;
                return (
                  <li key={index} className="text-sm text-gray-600 flex justify-between">
                    <span>{f.name}</span>
                    <span>{formatFileSize(f.size)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {uploadStatus && (
          <div
            className={`p-3 rounded-md ${
              uploadStatus.success
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {uploadStatus.message}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? '上传中...' : '上传文件'}
        </Button>
      </CardContent>
    </Card>
  );
}
