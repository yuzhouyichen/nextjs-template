'use client';
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  // 错误对象
  error: Error & { digest?: string };
  // 重置函数
  reset: () => void;
}) {
  useEffect(() => {
    // 可选地记录错误到错误报告服务
    console.error(error);
  }, [error]);
 
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // 尝试通过重新渲染发票路由来恢复
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}