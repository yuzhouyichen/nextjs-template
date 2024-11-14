import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // 匹配所有页面，除了api,静态资源,图片
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};