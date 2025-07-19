import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '文档搜索系统',
  description: '一个强大的文档上传、解析和搜索系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  )
}
