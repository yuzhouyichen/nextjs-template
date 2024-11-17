import { Metadata } from 'next';


// 元数据, 负责显示在浏览器标签页上的网页标题。 它对搜索引擎优化至关重要，因为它能帮助搜索引擎了解网页的内容。
export const metadata: Metadata = {
  title: 'Invoices',
  description: 'Invoices page',
  icons: {
    icon: '/customers/evil-rabbit.png',
  },
};

// 使用props获取搜索参数
// 添加 SearchParams 类型导入
export default async function Page() {
  return (
    <div className="w-full">
      invoices
    </div>
  );
}