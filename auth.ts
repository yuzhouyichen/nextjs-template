import NextAuth, { User } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { supabase } from "@/app/lib/supabase"
import bcrypt from 'bcrypt';

// 添加自定义用户类型
interface DbUser extends User {
    password: string;
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // 凭证认证，这里调用登录的时候会被调用
    Credentials({
      async authorize(credentials) {
        console.info('credentials', credentials);
        // 解析凭证
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        // 如果解析成功
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            // 数据库中获取用户
            const user = await getUser(email);
            // 如果用户不存在，则返回null
            if (!user) return null;

            // 密码加密方法
            // const hashedPassword = await bcrypt.hash(password, 10);
            // console.log("hashedPassword",hashedPassword);
            // 验证加密后密码
            const passwordsMatch = await bcrypt.compare(password, user.password);
            // 如果密码匹配，则返回用户
            if (passwordsMatch) return user;
          }
          // 如果密码不匹配，则返回null
          console.log('Invalid credentials');
          return null;
      },
    }),
  ],
});

// 从数据库中获取用户
async function getUser(email: string): Promise<DbUser | undefined> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
}