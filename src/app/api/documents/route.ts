import { NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET() {
  try {
    const documents = await db.getAllDocuments();
    console.log('Documents API returning:', documents.length, 'documents');
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json({ error: '获取文档列表失败' }, { status: 500 });
  }
}
