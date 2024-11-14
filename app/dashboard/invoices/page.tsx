import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
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
export default async function Page(props: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  // 获取搜索参数 必须使用await，因为searchParams是异步的
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = parseInt(searchParams?.page || '1');

  // 获取总页数
  const totalPages = await fetchInvoicesPages(query);
    
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>

      {/* 使用Suspense来处理延迟加载的组件 */}
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}