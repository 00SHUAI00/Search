<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 文档搜索系统 - Copilot 指导

这是一个基于 Next.js 的文档搜索项目，包含以下特性：

## 项目结构
- 使用 Next.js 14 + TypeScript + Tailwind CSS
- 文档上传和解析功能
- 全文搜索引擎
- SQLite 数据库存储

## 技术栈
- **前端**: Next.js, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite with FTS5 全文搜索
- **文档解析**: pdf-parse, mammoth (Word文档), 纯文本
- **文件处理**: multer, sharp

## 主要功能
1. **文档上传**: 支持 PDF, DOCX, TXT 格式
2. **内容解析**: 自动提取主题和段落
3. **全文搜索**: 支持"与"搜索条件
4. **搜索结果**: 显示相关度评分和匹配词

## 编码约定
- 使用 TypeScript 进行类型安全
- 组件采用函数式组件 + hooks
- 使用 Tailwind CSS 进行样式
- API 路由遵循 RESTful 设计
- 错误处理要完善

## 数据流
1. 用户上传文档 -> API解析 -> 存储到SQLite
2. 用户搜索 -> FTS5全文搜索 -> 返回结果
3. 文档列表 -> 从数据库获取所有文档

## 安全考虑
- 文件类型验证
- 文件大小限制
- 路径遍历防护
- SQL 注入防护
