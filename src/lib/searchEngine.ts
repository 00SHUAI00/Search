import { db } from './database';
import { SearchResult, SearchQuery } from '../types';

export class SearchEngine {
  static async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // 使用db的搜索功能
      const results = await db.searchContent(query.terms);
      console.log('Raw database results:', results);
      
      // 转换结果格式并计算相关性得分
      const searchResults: SearchResult[] = results.map((row: any) => {
        const content = row.topic_title + ' ' + row.description;
        const relevanceScore = this.calculateRelevanceScore(query.terms, content);
        const matchedTerms = this.findMatchedTerms(query.terms, content);
        
        return {
          document: {
            id: row.document_id,
            title: row.document_title,
            filename: row.filename,
            filePath: '', // 出于安全考虑，不暴露完整路径
            fileType: row.fileType,
            uploadDate: new Date(row.uploadDate),
            topics: []
          },
          topic: {
            id: row.topic_id,
            documentId: row.document_id,
            title: row.topic_title,
            description: row.description,
            images: JSON.parse(row.images || '[]'),
            order: row.order
          },
          relevanceScore,
          matchedTerms
        };
      });

      console.log('Transformed search results:', searchResults);
      console.log('First result topic title:', searchResults[0]?.topic?.title);
      console.log('First result topic description:', searchResults[0]?.topic?.description);

      // 最终过滤：只返回相关性得分大于等于最低阈值的结果
      const minRelevanceScore = query.terms.length; // 最低得分 = 关键词数量
      const finalResults = searchResults.filter(result => 
        result.relevanceScore >= minRelevanceScore && 
        result.matchedTerms.length > 0
      );

      console.log(`Filtered results: ${finalResults.length} out of ${searchResults.length} (min score: ${minRelevanceScore})`);

      // 按相关性排序
      return finalResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  private static calculateRelevanceScore(terms: string[], content: string): number {
    const lowerContent = content.toLowerCase();
    let score = 0;
    let matchedTermsCount = 0;
    
    terms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      if (lowerContent.includes(lowerTerm)) {
        matchedTermsCount++;
        
        // 计算词频
        const matches = (lowerContent.match(new RegExp(lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        
        // 基础得分：每次匹配+1分
        score += matches;
        
        // 完整词匹配额外加分
        const wordBoundaryRegex = new RegExp(`\\b${lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        const wordMatches = (lowerContent.match(wordBoundaryRegex) || []).length;
        score += wordMatches * 2; // 完整词匹配额外+2分
        
        // 开头匹配额外加分
        if (lowerContent.startsWith(lowerTerm)) {
          score += 3;
        }
      }
    });
    
    // 如果所有关键词都匹配到，给予奖励分数
    if (matchedTermsCount === terms.length) {
      score += 5;
    }
    
    return score;
  }

  private static findMatchedTerms(terms: string[], content: string): string[] {
    const lowerContent = content.toLowerCase();
    return terms.filter(term => 
      lowerContent.includes(term.toLowerCase())
    );
  }

  static async getAllDocuments() {
    try {
      return await db.getAllDocuments();
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
}
