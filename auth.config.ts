import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// 配置认证，中间件会调用此配置
export const authConfig = {
  pages: {
    // 指定登录页面,如果用户未登录,则重定向到登录页面
    signIn: '/login',
  },
  callbacks: {
    // 判断用户是否可以访问该页面，如果不能访问，则重定向到登录页面
    authorized({ auth, request: { nextUrl } }) {
      // 判断用户是否登录 
      const isLoggedIn = !!auth?.user;
      // 判断用户是否在dashboard页面
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        // 如果用户已登录,则返回true
        if (isLoggedIn) return true;
        // 如果用户未登录,则重定向到登录页面
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // 如果用户已登录,则重定向到dashboard页面
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  // 指定认证提供者，提供者是一个数组，您可以在其中列出不同的登录选项，如凭证登录、Google 或 GitHub
  providers: [Credentials({})], 
} satisfies NextAuthConfig;