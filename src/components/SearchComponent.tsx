'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { SearchResult } from '../types';
import { formatDate, highlightText } from '../lib/utils';

interface SearchComponentProps {
  onSearchResults: (results: SearchResult[]) => void;
}

export default function SearchComponent({ onSearchResults }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    // 如果搜索栏为空，清空搜索结果
    if (!searchQuery.trim()) {
      setSearchResults([]);
      onSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const terms = searchQuery.trim().split(/\s+/);
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          terms,
          operator: 'AND'
        }),
      });

      const results: SearchResult[] = await response.json();
      setSearchResults(results);
      onSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // 如果输入框被清空，自动清空搜索结果
    if (!value.trim() && searchResults.length > 0) {
      setSearchResults([]);
      onSearchResults([]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>文档搜索</CardTitle>
          <CardDescription>
            在所有已上传的文档中搜索主题和内容。支持多关键词"与"搜索。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="输入搜索关键词，用空格分隔多个词..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? '搜索中...' : (searchQuery.trim() ? '搜索' : '清空')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            搜索结果 ({searchResults.length} 条)
          </h3>
          
          {searchResults.map((result, index) => (
            <Card key={`${result.document.id}-${result.topic.id}-${index}`} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="max-h-16 overflow-y-auto mb-1">
                      <CardTitle className="text-lg leading-tight break-words">
                        {result.document.title}
                      </CardTitle>
                    </div>
                    <div className="max-h-12 overflow-y-auto">
                      <CardDescription className="break-words">
                        {result.document.filename} • {formatDate(result.document.uploadDate)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex-shrink-0">
                    相关度: {result.relevanceScore}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-l-4 border-blue-400 pl-4 mb-3">
                  <div className="max-h-16 overflow-y-auto mb-2">
                    <h4 className="font-semibold text-blue-800 leading-tight">{result.topic.title}</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {result.topic.description}
                    </p>
                  </div>
                </div>
                
                {result.matchedTerms.length > 0 && (
                  <div className="max-h-20 overflow-y-auto border-t pt-3">
                    <div className="flex flex-wrap gap-1 items-start">
                      <span className="text-xs text-gray-500 mr-2 flex-shrink-0">匹配词:</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {result.matchedTerms.map((term, termIndex) => (
                          <span
                            key={termIndex}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded break-words"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {result.topic.images.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">包含图片: {result.topic.images.length} 张</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !searching && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">没有找到匹配的结果</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
