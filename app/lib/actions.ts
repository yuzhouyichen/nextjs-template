"use server";

import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


// 创建发票的Schema,包含id和date,作用是验证数据
const InvoiceSchema = z.object({
  // 发票ID
  id: z.string(),
  // 客户ID
  customerId: z.string(),
  // 将amount转换为数字，并确保其大于0
  amount: z.coerce.number().gt(0),
  // 状态只能是pending或paid
  status: z.enum(['pending', 'paid']),
  // 日期
  date: z.string(),
});

// 这行代码使用 omit 方法从原始的 CreateInvoiceSchema 中移除了 id 和 date 字段
//id 通常由数据库自动生成,date 通常由服务器自动生成
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {

    // 解析表单数据
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // 将金额转换为美分
    const amountInCents = amount * 100;
    // 获取当前日期
    const date = new Date().toISOString().split('T')[0];

    // 创建发票
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // 重新验证发票列表页面,作用是清除缓存，这里的缓存是指存储在浏览器中的数据
    revalidatePath('/dashboard/invoices');
    // 重定向到发票列表页面
    redirect('/dashboard/invoices');
}


// 更新发票的Schema，不包含id和date
const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });
// 更新发票
export async function updateInvoice(id: string, formData: FormData) {
    // 解析表单数据
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // 将金额转换为美分
    const amountInCents = amount * 100;
    // 更新发票
    await sql`
        UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}
    `;
    // 重新验证发票列表页面
    revalidatePath('/dashboard/invoices');
    // 重定向到发票列表页面
    redirect('/dashboard/invoices');
}

// 删除发票
export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}