import Database from 'better-sqlite3';
import { Document, Topic } from '../types';
import * as path from 'path';
import * as fs from 'fs';

// 确保数据库目录存在
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'documents.db');

class DocumentDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    // 创建文档表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        upload_date DATETIME NOT NULL
      )
    `);

    // 创建主题表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        images TEXT DEFAULT '[]',
        topic_order INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
      )
    `);

    // 创建索引以提高搜索性能
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_topics_document_id ON topics (document_id);
      CREATE INDEX IF NOT EXISTS idx_topics_title ON topics (title);
      CREATE INDEX IF NOT EXISTS idx_topics_description ON topics (description);
    `);

    console.log('Database tables initialized successfully');
  }

  async saveDocument(document: Omit<Document, 'topics'>): Promise<void> {
    console.log('Saving document to SQLite:', document.id, document.title);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO documents (id, title, filename, file_path, file_type, upload_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        document.id,
        document.title,
        document.filename,
        document.filePath,
        document.fileType,
        document.uploadDate.toISOString()
      );
      console.log('Document saved successfully to SQLite');
    } catch (error) {
      console.error('Error saving document to SQLite:', error);
      throw error;
    }
  }

  async saveTopic(topic: Topic): Promise<void> {
    console.log('Saving topic to SQLite:', topic.id, topic.title, 'for document:', topic.documentId);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO topics (id, document_id, title, description, images, topic_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        topic.id,
        topic.documentId,
        topic.title,
        topic.description,
        JSON.stringify(topic.images || []),
        topic.order
      );
      console.log('Topic saved successfully to SQLite');
    } catch (error) {
      console.error('Error saving topic to SQLite:', error);
      throw error;
    }
  }

  async searchContent(terms: string[]): Promise<any[]> {
    console.log('Searching SQLite for terms:', terms);
    
    if (terms.length === 0) return [];
    
    // 构建更严格的搜索查询
    // 每个关键词都必须在标题或描述中出现（AND逻辑）
    const searchConditions = terms.map(() => '(t.title LIKE ? OR t.description LIKE ?)').join(' AND ');
    const searchValues = terms.flatMap(term => [`%${term}%`, `%${term}%`]);

    const stmt = this.db.prepare(`
      SELECT 
        d.id as document_id,
        d.title as document_title,
        d.filename,
        d.file_type as fileType,
        d.upload_date as uploadDate,
        t.id as topic_id,
        t.title as topic_title,
        t.description,
        t.images,
        t.topic_order as "order"
      FROM topics t
      INNER JOIN documents d ON t.document_id = d.id
      WHERE ${searchConditions}
      ORDER BY d.upload_date DESC, t.topic_order ASC
    `);

    try {
      const results = stmt.all(...searchValues);
      console.log('SQLite search results found:', results.length);
      
      // 二次过滤：计算每个结果的相关性得分，过滤掉得分过低的结果
      const filteredResults = results.filter((result: any) => {
        const combinedText = `${result.topic_title} ${result.description}`.toLowerCase();
        let score = 0;
        let matchedTermsCount = 0;
        
        terms.forEach(term => {
          const lowerTerm = term.toLowerCase();
          if (combinedText.includes(lowerTerm)) {
            matchedTermsCount++;
            // 标题匹配得分更高
            if (result.topic_title.toLowerCase().includes(lowerTerm)) {
              score += 3;
            }
            // 描述匹配
            if (result.description.toLowerCase().includes(lowerTerm)) {
              score += 1;
            }
          }
        });
        
        // 至少要有一个关键词匹配，且得分大于0
        return matchedTermsCount > 0 && score > 0;
      });
      
      console.log('Filtered search results:', filteredResults.length);
      return filteredResults;
    } catch (error) {
      console.error('Error searching SQLite:', error);
      return [];
    }
  }

  async getAllDocuments(): Promise<Document[]> {
    console.log('Getting all documents from SQLite');
    
    const stmt = this.db.prepare(`
      SELECT 
        d.id,
        d.title,
        d.filename,
        d.file_path as filePath,
        d.file_type as fileType,
        d.upload_date as uploadDate
      FROM documents d
      ORDER BY d.upload_date DESC
    `);

    const topicsStmt = this.db.prepare(`
      SELECT id, title, description, images, topic_order as "order"
      FROM topics 
      WHERE document_id = ? 
      ORDER BY topic_order ASC
    `);

    try {
      const docRows: any[] = stmt.all();
      console.log('SQLite documents found:', docRows.length);
      
      // Get topics for each document
      const documents = docRows.map(doc => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate),
        topics: topicsStmt.all(doc.id).map((topic: any) => ({
          ...topic,
          documentId: doc.id,
          images: topic.images ? JSON.parse(topic.images) : []
        }))
      }));
      
      return documents;
    } catch (error) {
      console.error('Error getting documents from SQLite:', error);
      return [];
    }
  }

  async getDocumentById(id: string): Promise<Document | null> {
    console.log('Getting document by ID from SQLite:', id);
    
    const docStmt = this.db.prepare(`
      SELECT * FROM documents WHERE id = ?
    `);
    
    const topicsStmt = this.db.prepare(`
      SELECT * FROM topics WHERE document_id = ? ORDER BY topic_order ASC
    `);

    try {
      const docRow: any = docStmt.get(id);
      if (!docRow) return null;

      const topicRows: any[] = topicsStmt.all(id);
      
      const document: Document = {
        id: docRow.id,
        title: docRow.title,
        filename: docRow.filename,
        filePath: docRow.file_path,
        fileType: docRow.file_type,
        uploadDate: new Date(docRow.upload_date),
        topics: topicRows.map((row: any) => ({
          id: row.id,
          documentId: row.document_id,
          title: row.title,
          description: row.description,
          images: JSON.parse(row.images || '[]'),
          order: row.topic_order
        }))
      };

      return document;
    } catch (error) {
      console.error('Error getting document by ID from SQLite:', error);
      return null;
    }
  }

  async getTopicsByDocumentId(documentId: string): Promise<Topic[]> {
    console.log('Getting topics by document ID from SQLite:', documentId);
    
    const stmt = this.db.prepare(`
      SELECT * FROM topics WHERE document_id = ? ORDER BY topic_order ASC
    `);

    try {
      const rows: any[] = stmt.all(documentId);
      return rows.map((row: any) => ({
        id: row.id,
        documentId: row.document_id,
        title: row.title,
        description: row.description,
        images: JSON.parse(row.images || '[]'),
        order: row.topic_order
      }));
    } catch (error) {
      console.error('Error getting topics by document ID from SQLite:', error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    console.log('Deleting document from SQLite:', documentId);
    
    const deleteTopicsStmt = this.db.prepare('DELETE FROM topics WHERE document_id = ?');
    const deleteDocStmt = this.db.prepare('DELETE FROM documents WHERE id = ?');

    try {
      // 使用事务确保数据一致性
      const transaction = this.db.transaction(() => {
        const topicsResult = deleteTopicsStmt.run(documentId);
        const docResult = deleteDocStmt.run(documentId);
        
        console.log(`Deleted ${topicsResult.changes} topics and ${docResult.changes} document`);
        return docResult.changes > 0;
      });

      const success = transaction();
      console.log('Document deletion result:', success);
      return success;
    } catch (error) {
      console.error('Error deleting document from SQLite:', error);
      return false;
    }
  }

  async addToSearchIndex(content: string, documentId: string, topicId: string, type: string): Promise<void> {
    // SQLite的全文搜索索引已通过普通索引实现，这里不需要额外操作
    console.log(`Search index updated for ${type}: ${content.substring(0, 50)}...`);
  }

  // 关闭数据库连接（在应用关闭时调用）
  close(): void {
    this.db.close();
  }
}

// 创建并导出数据库实例
export const db = new DocumentDatabase();
