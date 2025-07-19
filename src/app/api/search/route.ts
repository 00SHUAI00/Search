import { NextRequest, NextResponse } from 'next/server';
import { SearchEngine } from '../../../lib/searchEngine';
import { SearchQuery } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { terms, operator = 'AND' }: SearchQuery = body;

    if (!terms || !Array.isArray(terms)) {
      return NextResponse.json({ error: '搜索关键词格式错误' }, { status: 400 });
    }

    // 如果搜索词为空，返回空结果（用于清空搜索结果）
    if (terms.length === 0) {
      return NextResponse.json([]);
    }

    const searchQuery: SearchQuery = { terms, operator };
    const results = await SearchEngine.search(searchQuery);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
