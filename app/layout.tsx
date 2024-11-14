import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

// 元数据, 负责显示在浏览器标签页上的网页标题。 它对搜索引擎优化至关重要，因为它能帮助搜索引擎了解网页的内容。
// 可以放在layout.tsx中，也可以放在每个页面中, 如果放在layout.tsx中，则每个页面都会使用这个元数据, 如果放在每个页面中，则每个页面都会使用这个元数据
export const metadata: Metadata = {
  title: 'Acme Dashboard',
  description: 'The official Next.js Learn Dashboard built with App Router.',
  keywords: 'Next.js, App Router, dashboard, learn',
  // 元数据的基础URL
  metadataBase: new URL('https://next-learn-dashboard.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
