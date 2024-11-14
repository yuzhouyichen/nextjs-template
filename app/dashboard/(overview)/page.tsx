import React, { Suspense } from 'react';
import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { LatestInvoicesSkeleton, RevenueChartSkeleton,CardsSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';

// 元数据, 负责显示在浏览器标签页上的网页标题。 它对搜索引擎优化至关重要，因为它能帮助搜索引擎了解网页的内容。
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'The overview page',
};


// This is a server component,This allows you to use await to fetch data.
const Dashboard = async () => {

  // 获取数据较慢，耗时3秒，所以此组件阻碍了整个页面加载
  //const revenue = await fetchRevenue();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
            <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* 使用Suspense来处理延迟加载的组件 */}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        {/* 使用Suspense来处理延迟加载的组件 */}
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}

export default Dashboard;
