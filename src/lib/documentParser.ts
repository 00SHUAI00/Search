import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import { Document, Topic } from '../types';
import { randomUUID } from 'crypto';

export class DocumentParser {
  static async parseDocument(filePath: string, filename: string): Promise<{ document: Omit<Document, 'topics'>, topics: Topic[] }> {
    const fileType = this.getFileType(filename);
    let content = '';

    try {
      switch (fileType) {
        case 'pdf':
          content = await this.parsePDF(filePath);
          break;
        case 'docx':
          content = await this.parseDocx(filePath);
          break;
        case 'txt':
          content = await this.parseText(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      const documentId = randomUUID();
      const topics = await this.extractTopics(content, documentId);

      const document: Omit<Document, 'topics'> = {
        id: documentId,
        title: this.extractTitle(filename, content),
        filename,
        filePath,
        fileType,
        uploadDate: new Date()
      };

      return { document, topics };
    } catch (error) {
      throw new Error(`Failed to parse document: ${error}`);
    }
  }

  private static getFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    return ext || 'unknown';
  }

  private static async parsePDF(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  private static async parseDocx(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    
    try {
      // 动态导入mammoth避免ES模块问题
      const mammoth = await import('mammoth');
      
      // 使用HTML输出来保留标题结构，然后转换为Markdown格式
      const result = await mammoth.convertToHtml({ buffer }, {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh", 
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh"
        ]
      });
      
      // 将HTML转换为Markdown格式的文本
      return this.convertHtmlToMarkdown(result.value);
    } catch (error) {
      console.error('Error in parseDocx:', error);
      throw error;
    }
  }

  private static convertHtmlToMarkdown(html: string): string {
    // 简单的HTML到Markdown转换
    let markdown = html
      // 转换标题
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      // 转换段落
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // 转换换行
      .replace(/<br\s*\/?>/gi, '\n')
      // 移除其他HTML标签
      .replace(/<[^>]+>/g, '')
      // 清理多余的空行
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    
    return markdown;
  }

  private static async parseText(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('utf-8');
  }

  private static extractTitle(filename: string, content: string): string {
    // 首先尝试从文件名提取标题
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // 如果内容中有明显的标题行，使用它
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 100 && firstLine.length > 5) {
        return firstLine;
      }
    }
    
    return nameWithoutExt;
  }

  private static async extractTopics(content: string, documentId: string): Promise<Topic[]> {
    const topics: Topic[] = [];
    
    // 简单的主题提取逻辑
    // 这里可以根据实际需求实现更复杂的NLP处理
    const sections = this.splitIntoSections(content);
    
    sections.forEach((section, index) => {
      if (section.title.trim() && section.content.trim()) {
        topics.push({
          id: randomUUID(),
          documentId,
          title: section.title,
          description: section.content,
          images: [], // 这里可以添加图片提取逻辑
          order: index
        });
      }
    });

    // 如果没有明显的章节，将整个文档作为一个主题
    if (topics.length === 0) {
      const words = content.split(/\s+/);
      const chunks: string[] = [];
      
      for (let i = 0; i < words.length; i += 200) {
        chunks.push(words.slice(i, i + 200).join(' '));
      }
      
      chunks.forEach((chunk: string, index: number) => {
        if (chunk.trim()) {
          topics.push({
            id: randomUUID(),
            documentId,
            title: `Section ${index + 1}`,
            description: chunk.trim(),
            images: [],
            order: index
          });
        }
      });
    }

    return topics;
  }

  private static splitIntoSections(content: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = [];
    const lines = content.split('\n');
    
    let currentTitle = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检测Markdown标题（## 标题）或其他可能的标题行
      if (this.isProbableTitle(trimmedLine)) {
        // 保存前一个章节
        if (currentTitle || currentContent.length > 0) {
          sections.push({
            title: currentTitle || 'Introduction',
            content: currentContent.join('\n').trim()
          });
        }
        
        // 开始新章节，清理标题格式
        currentTitle = trimmedLine.replace(/^#+\s*/, ''); // 移除Markdown标题标记
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // 添加最后一个章节
    if (currentTitle || currentContent.length > 0) {
      sections.push({
        title: currentTitle || 'Content',
        content: currentContent.join('\n').trim()
      });
    }
    
    return sections;
  }

  private static isProbableTitle(line: string): boolean {
    if (!line || line.length === 0) return false;
    
    // 首先检查Markdown标题格式
    if (/^#+\s+.+/.test(line)) {
      return true;
    }
    
    // 检查表情符号主题标记
    if (/^[🌐🔍🏗️🧭📆🗂️]\s*.+/.test(line)) {
      return true;
    }
    
    // 检查是否可能是标题的其他规则
    const titlePatterns = [
      /^第[一二三四五六七八九十\d]+[章节部分]/,  // 中文章节
      /^Chapter\s+\d+/i,                        // 英文章节
      /^Section\s+\d+/i,                        // 英文节
      /^\d+[\.\s]/,                             // 数字开头
      /^[A-Z][^.]*$/,                           // 全大写或首字母大写且无句号结尾
    ];
    
    return titlePatterns.some(pattern => pattern.test(line)) &&
           line.length < 100 &&  // 标题通常不会太长
           line.length > 3 &&    // 标题也不会太短
           !line.includes('。') && // 中文标题通常不以句号结尾
           !line.endsWith('.');   // 英文标题通常不以句号结尾
  }
}
