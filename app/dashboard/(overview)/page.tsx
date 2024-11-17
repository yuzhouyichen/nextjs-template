import React from 'react';
import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';

// 元数据, 负责显示在浏览器标签页上的网页标题。 它对搜索引擎优化至关重要，因为它能帮助搜索引擎了解网页的内容。
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'The overview page',
};


const Dashboard = async () => {

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
    </main>
  );
}

export default Dashboard;
