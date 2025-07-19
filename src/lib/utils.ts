// 简化的工具函数，不依赖外部库
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date | string | number): string {
  try {
    const dateObj = new Date(date);
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '无效日期';
    }
    
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', date);
    return '日期错误';
  }
}

export function highlightText(text: string, searchTerms: string[]): string {
  let highlighted = text;
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  
  return highlighted;
}
