# GitHub 上传指南

## 🚀 将项目上传到 GitHub

### 准备工作

1. 确保您有 GitHub 账户和现有仓库的地址
2. 确保本地已安装 Git
3. 确保项目已清理完毕（无测试文件、调试代码等）

### 步骤1：初始化 Git 仓库

```bash
# 初始化本地 Git 仓库
git init

# 添加所有文件到暂存区
git add .

# 创建初始提交
git commit -m "Initial commit: Document search system with Word Heading2 support"
```

### 步骤2：连接到远程仓库

```bash
# 添加远程仓库地址（替换为您的实际仓库地址）
git remote add origin https://github.com/your-username/your-repository.git

# 验证远程仓库地址
git remote -v
```

### 步骤3：推送到 GitHub

```bash
# 推送到主分支
git push -u origin main

# 如果仓库使用 master 分支，使用：
# git push -u origin master
```

### 可能遇到的问题及解决方案

#### 问题1：远程仓库已有内容
```bash
# 强制推送（谨慎使用）
git push -u origin main --force

# 或者合并远程内容
git pull origin main --allow-unrelated-histories
git push -u origin main
```

#### 问题2：认证失败
- 使用 Personal Access Token 代替密码
- 配置 SSH 密钥

#### 问题3：分支名称不匹配
```bash
# 重命名本地分支
git branch -M main

# 或推送到指定分支
git push -u origin HEAD:main
```

### 验证上传成功

1. 访问您的 GitHub 仓库页面
2. 确认所有文件已正确上传
3. 检查 README.md 显示是否正常

### 后续维护

```bash
# 日常更新流程
git add .
git commit -m "Update: 描述修改内容"
git push
```

### 建议的提交信息格式

- `feat: 添加新功能`
- `fix: 修复bug`
- `docs: 更新文档`
- `style: 代码格式调整`
- `refactor: 代码重构`
- `test: 添加测试`
- `chore: 构建过程或辅助工具的变动`

## 📋 上传前检查清单

- [ ] 删除了所有测试文件
- [ ] 删除了调试代码和日志
- [ ] 更新了 README.md
- [ ] 确认 .gitignore 正确配置
- [ ] 数据库文件被忽略（包含敏感数据）
- [ ] node_modules 被忽略
- [ ] 上传目录被忽略（包含用户文件）

## 🔒 安全注意事项

- 确保不要上传数据库文件（包含用户数据）
- 确保不要上传用户上传的文档
- 检查代码中是否有硬编码的密钥或敏感信息
- 配置正确的 .gitignore 文件
