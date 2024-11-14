import React from 'react'
import { Metadata } from 'next';

// 元数据, 负责显示在浏览器标签页上的网页标题。 它对搜索引擎优化至关重要，因为它能帮助搜索引擎了解网页的内容。
export const metadata: Metadata = {
  title: 'Customers',
  description: 'Customers page',
};

const Customers = () => {
  return (
    <div>
      <h1>Customers</h1>
    </div>
  )
}

export default Customers;
