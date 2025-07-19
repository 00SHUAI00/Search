'use client';

import React, { useState } from 'react';
import UploadComponent from '../components/UploadComponent';
import SearchComponent from '../components/SearchComponent';
import DocumentList from '../components/DocumentList';
import { SearchResult } from '../types';

export default function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'documents'>('search');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDocumentDeleted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              文档搜索系统
            </h1>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                搜索
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                上传
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'documents'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                文档库
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && (
          <SearchComponent onSearchResults={handleSearchResults} />
        )}
        
        {activeTab === 'upload' && (
          <UploadComponent onUploadSuccess={handleUploadSuccess} />
        )}
        
        {activeTab === 'documents' && (
          <DocumentList 
            refreshTrigger={refreshTrigger} 
            onDocumentDeleted={handleDocumentDeleted}
          />
        )}
      </main>
    </div>
  );
}
