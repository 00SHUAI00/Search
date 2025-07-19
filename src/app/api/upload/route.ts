import { NextRequest, NextResponse } from 'next/server';
import { DocumentParser } from '../../../lib/documentParser';
import { db } from '../../../lib/database';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有选择文件' }, { status: 400 });
    }

    const uploadResults: Array<{
      filename: string;
      success: boolean;
      error?: string;
      documentId?: string;
      topicsCount?: number;
    }> = [];

    for (const file of files) {
      try {
        // 验证文件类型
        const allowedTypes = [
          'application/pdf', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
          'text/plain',
          'application/octet-stream' // 支持curl上传
        ];
        
        // 如果是octet-stream，根据文件扩展名进一步验证
        if (file.type === 'application/octet-stream') {
          const ext = file.name.toLowerCase().split('.').pop();
          if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
            uploadResults.push({
              filename: file.name,
              success: false,
              error: '不支持的文件类型'
            });
            continue;
          }
        } else if (!allowedTypes.includes(file.type)) {
          uploadResults.push({
            filename: file.name,
            success: false,
            error: '不支持的文件类型'
          });
          continue;
        }

        // 创建uploads目录
        const uploadsDir = path.join(process.cwd(), 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // 生成唯一文件名
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const filePath = path.join(uploadsDir, filename);

        // 保存文件
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // 解析文档
        const { document, topics } = await DocumentParser.parseDocument(filePath, file.name);

        // 保存到数据库
        await db.saveDocument(document);
        
        // 保存主题
        for (const topic of topics) {
          await db.saveTopic(topic);
        }

        uploadResults.push({
          filename: file.name,
          success: true,
          documentId: document.id,
          topicsCount: topics.length
        });

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        uploadResults.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;
    const failureCount = uploadResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `处理完成：${successCount} 个文件成功，${failureCount} 个文件失败`,
      results: uploadResults
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: '上传处理失败' 
    }, { status: 500 });
  }
}