import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database';
import * as fs from 'fs';
import * as path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    console.log('DELETE request for document:', documentId);

    // 获取文档信息（用于删除文件）
    const document = await db.getDocumentById(documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // 删除数据库中的文档记录
    const deleted = await db.deleteDocument(documentId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete document from database' },
        { status: 500 }
      );
    }

    // 尝试删除物理文件
    try {
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
        console.log('Physical file deleted:', document.filePath);
      }
    } catch (fileError) {
      console.log('Warning: Could not delete physical file:', fileError);
      // 即使文件删除失败，数据库记录已删除，仍返回成功
    }

    return NextResponse.json(
      { 
        message: 'Document deleted successfully',
        documentId: documentId 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
