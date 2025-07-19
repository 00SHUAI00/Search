# 文档搜索系统

一个基于 Next.js 的智能文档搜索和管理系统，支持多种文档格式的上传、结构化解析和高级全文搜索。

## ✨ 功能特性

- 📄 **多格式支持**: 支持 PDF、Word (DOCX) 和文本文件上传
- � **智能解析**: 自动识别 Word 文档中的 Heading2 格式，转换为结构化主题
- 🔍 **全文搜索**: 基于 SQLite FTS5 的高性能全文搜索引擎
- 🎯 **精确匹配**: 支持多关键词 AND 搜索，智能相关度评分
- 🖼️ **响应式界面**: 优雅的滚动条设计，适配各种屏幕尺寸
- ⚡ **实时响应**: 快速的搜索体验，支持实时清空
- 🗃️ **文档管理**: 完整的文档生命周期管理（上传、查看、删除）
- 💾 **数据持久化**: SQLite 数据库，支持事务和自动清理

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn 包管理器

### 快速启动

**Windows:**
```bash
start.bat
```

**Unix/Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**手动启动:**
```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📖 使用指南

### 1. 上传文档

1. 点击顶部导航栏的"上传"标签
2. 选择要上传的文档文件（支持 PDF、DOCX、TXT）
3. 点击"上传文件"按钮
4. 系统将自动解析文档内容，识别 Word 文档中的 Heading2 格式并建立搜索索引

### 2. 搜索文档

1. 在搜索页面输入关键词
2. 多个关键词用空格分隔（使用 AND 搜索逻辑）
3. 系统将返回匹配的文档段落，按相关度排序
4. 查看搜索结果，长内容自动显示滚动条
5. 清空搜索框将自动清除搜索结果

### 3. 查看和管理文档库

1. 点击"文档库"标签查看所有已上传的文档
2. 浏览文档的结构化主题（支持滚动查看长内容）
3. 查看每个文档包含的主题数量和上传时间
4. 点击删除按钮移除不需要的文档（自动清理相关数据）

## 📋 当前文档

系统中包含以下示例文档：

- **Project Lumina**: 版本规划提案（4个主题）
  - 市场趋势分析
  - 用户画像与行为  
  - 迭代节奏与版本路线
  - 风险与应对策略

- **Project Solaris**: 初期调研报告（5个主题）
  - 市场趋势分析
  - 用户画像与行为
  - 技术架构建议
  - 风险与应对策略
  - 实施时间表与资源配置

## 🏗️ 技术架构

### 前端技术栈

- **Next.js 14**: React 全栈框架
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **React Hooks**: 状态管理和副作用处理

### 后端技术栈

- **Next.js API Routes**: 服务端 API
- **SQLite**: 轻量级数据库（better-sqlite3）
- **FTS5**: SQLite 全文搜索扩展
- **事务支持**: ACID 数据库操作保证

### 文档处理

- **pdf-parse**: PDF 文档解析
- **mammoth**: Word 文档解析，支持 Heading2 格式识别和 HTML 转换
- **fs/promises**: 文本文件处理
- **结构化解析**: 自动识别 Markdown 标题和其他标题格式

### 搜索算法

- **全文搜索**: 基于 SQLite FTS5 的高性能搜索
- **相关度评分**: 智能计算匹配度
- **AND 逻辑**: 多关键词必须同时匹配
- **滚动优化**: 长内容自动显示滚动条

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── upload/        # 文档上传处理
│   │   ├── search/        # 高级搜索 API
│   │   └── documents/     # 文档CRUD API
│   │       └── [id]/      # 文档删除 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页面（标签页导航）
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   │   ├── button.tsx    # 按钮组件
│   │   ├── card.tsx      # 卡片组件
│   │   └── input.tsx     # 输入框组件
│   ├── UploadComponent.tsx   # 文档上传界面
│   ├── SearchComponent.tsx   # 搜索界面（优化滚动条）
│   └── DocumentList.tsx     # 文档列表（支持删除）
├── lib/                  # 核心库
│   ├── database.ts       # SQLite数据库操作
│   ├── documentParser.ts # 文档解析（支持Word Heading2）
│   ├── searchEngine.ts   # 搜索引擎
│   └── utils.ts         # 工具函数
├── types/               # TypeScript 类型定义
│   └── index.ts         # 完整类型定义
└── data/                # 数据存储
    └── documents.db     # SQLite数据库文件
```

## 🔧 配置说明

### 数据库配置

系统使用 SQLite 数据库（better-sqlite3），自动创建以下表：

- `documents`: 存储文档基本信息
- `topics`: 存储文档主题和内容
- 自动索引和外键约束支持

### 文件上传配置

- 支持的文件类型: PDF (.pdf), Word (.docx), 文本 (.txt)
- 上传目录: `uploads/`（自动创建）
- Word 文档: 自动识别 Heading2 格式并转换为 Markdown

### 界面优化

- 长内容自动显示滚动条
- 响应式设计适配各种屏幕
- 文档标题、内容、匹配词都有独立滚动区域

## 🛠️ 开发指南

### 添加新的文档格式支持

1. 在 `documentParser.ts` 中添加新的解析方法
2. 更新文件类型验证
3. 在上传 API 中添加 MIME 类型支持

### 自定义 Word 文档解析

当前支持 Heading2 格式识别：
- 使用 mammoth 库转换 HTML
- 自动转换为 Markdown 格式
- 支持标题层级识别

### 界面自定义

所有滚动区域都在 `SearchComponent.tsx` 中配置：
- 文档标题: `max-h-16`
- 主题内容: `max-h-64`  
- 匹配词区域: `max-h-20`

## 📝 API 文档

### POST /api/upload

上传文档文件

**请求**: multipart/form-data
- `files`: 文件数组

**响应**:
```json
{
  "success": true,
  "message": "处理完成：2 个文件成功，0 个文件失败",
  "results": [...]
}
```

### POST /api/search

搜索文档

**请求**: application/json
```json
{
  "terms": ["关键词1", "关键词2"],
  "operator": "AND"
}
```

**响应**: SearchResult[] 

### GET /api/documents

获取所有文档

**响应**: Document[] （包含主题信息）

### DELETE /api/documents/[id]

删除指定文档

**响应**:
```json
{
  "success": true,
  "message": "文档删除成功"
}
```

## 📅 更新日志

### 2025-07-19 - 当前版本

**新功能：**
- ✅ Word 文档 Heading2 格式识别支持
- ✅ 搜索结果界面滚动条优化
- ✅ 数据库孤立记录自动清理
- ✅ 项目文件整理和优化

**技术改进：**
- 🔧 mammoth 库集成，支持 Word 文档 HTML 转换
- 🔧 搜索组件界面优化，长内容自动滚动
- 🔧 DocumentParser 增强，支持多种标题格式识别
- 🔧 删除了所有测试文件和调试代码

**当前状态：**
- 📊 系统包含 2 个示例文档，9 个结构化主题
- 🗂️ 完整的文档管理和搜索功能
- 🎨 优化的用户界面和用户体验

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架  
- [SQLite](https://sqlite.org/) - 数据库引擎
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF 解析库
- [mammoth](https://www.npmjs.com/package/mammoth) - Word 文档解析库
