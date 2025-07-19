'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Document } from '../types';
import { formatDate } from '../lib/utils';

interface DocumentListProps {
  refreshTrigger: number;
  onDocumentDeleted?: () => void;
}

export default function DocumentList({ refreshTrigger, onDocumentDeleted }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const docs: Document[] = await response.json();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('确定要删除这个文档吗？此操作不可撤销。')) {
      return;
    }

    setDeletingId(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 从本地状态中移除文档
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
        
        // 通知父组件文档已删除
        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
        
        alert('文档删除成功');
      } else {
        const errorData = await response.json();
        alert(`删除失败: ${errorData.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('删除失败: 网络错误');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-8">
          <p>加载中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold">
        文档库 ({documents.length} 个文档)
      </h3>
      
      {documents.length === 0 ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">暂无文档，请先上传文档</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription>
                      {doc.filename} • {formatDate(doc.uploadDate)} • {doc.fileType?.toUpperCase() || 'UNKNOWN'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                      {doc.topics.length} 个主题
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? '删除中...' : '删除'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {doc.topics.length > 0 && (
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">主题概览:</h4>
                    <div className="grid gap-2">
                      {doc.topics.slice(0, 3).map((topic) => (
                        <div key={topic.id} className="border-l-2 border-blue-200 pl-3">
                          <h5 className="font-medium text-sm mb-2">{topic.title}</h5>
                          <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                            <p className="text-gray-600 whitespace-pre-wrap">
                              {topic.description}
                            </p>
                          </div>
                          {topic.images.length > 0 && (
                            <span className="text-xs text-blue-600 mt-1 inline-block">
                              包含 {topic.images.length} 张图片
                            </span>
                          )}
                        </div>
                      ))}
                      {doc.topics.length > 3 && (
                        <div className="text-xs text-gray-500 pl-3">
                          还有 {doc.topics.length - 3} 个主题...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
