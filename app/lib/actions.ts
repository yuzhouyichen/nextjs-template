"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { supabase } from '@/app/lib/supabase';

// 创建发票的Schema,包含id和date,作用是验证数据
const InvoiceSchema = z.object({
  // 发票ID
  id: z.string({
    // 错误信息
    invalid_type_error: 'Please select an invoice.',
  }),
  // 客户ID
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  // 将amount转换为数字，并确保其大于0
  amount: z.coerce.number().gt(0, {
    message: 'Please enter an amount greater than $0.',
  }),
  // 状态只能是pending或paid
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  // 日期
  date: z.string(),
});

// 这行代码使用 omit 方法从原始的 CreateInvoiceSchema 中移除了 id 和 date 字段
//id 通常由数据库自动生成,date 通常由服务器自动生成
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

// 定义一个State类型，包含message和errors
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
      };
    message?: string | null;
};

export async function createInvoice(state: State, formData: FormData) {

    // 解析表单数据
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // 如果解析失败，返回错误信息
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;

    // 将金额转换为美分
    const amountInCents = amount * 100;
    // 获取当前日期
    const date = new Date().toISOString().split('T')[0];

    // 创建发票
    try {
        const { error } = await supabase
            .from('invoices')
            .insert([
                { 
                    customer_id: customerId, 
                    amount: amountInCents, 
                    status, 
                    date 
                }
            ]);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to create invoice:', error);
        return {
            message: 'Database Error: Failed to create invoice.',
        };
    }

    // 重新验证发票列表页面,作用是清除缓存，这里的缓存是指存储在浏览器中的数据
    revalidatePath('/dashboard/invoices');
    // 重定向到发票列表页面
    redirect('/dashboard/invoices');
}

// 更新发票的Schema，不包含id和date
const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });
// 更新发票
export async function updateInvoice( id: string,prevState: State, formData: FormData) {
    // 解析表单数据
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // 如果解析失败，返回错误信息
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }
    // 解析成功，获取数据
    const { customerId, amount, status } = validatedFields.data;
    // 将金额转换为美分
    const amountInCents = amount * 100;
    // 更新发票
    try {
        const { error } = await supabase
            .from('invoices')
            .update({ 
                customer_id: customerId, 
                amount: amountInCents, 
                status 
            })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to update invoice:', error);
        return {
            message: 'Database Error: Failed to update invoice.',
        };
    }
    // 重新验证发票列表页面
    revalidatePath('/dashboard/invoices');
    // 重定向到发票列表页面
    redirect('/dashboard/invoices');
}

// 删除发票
export async function deleteInvoice(id: string) {
    try {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete invoice:', error);
        throw new Error('Failed to delete invoice.');
    }
    // 重新验证发票列表页面
    revalidatePath('/dashboard/invoices');
}

// 认证函数
export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        // 使用凭证认证
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
              case 'CredentialsSignin':
                return 'Invalid credentials.';
              default:
                return 'Something went wrong.';
            }
          }
          throw error;
    }
}   