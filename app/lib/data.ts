import { supabase } from './supabase';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const { data, error } = await supabase
      .from('revenue')
      .select('*');

    if (error) throw error;
    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        amount,
        customers (
          name,
          image_url,
          email
        ),
        id
      `)
      .order('date', { ascending: false })
      .limit(5);

    if (error) throw error;

    const latestInvoices = data.map((invoice) => ({
      amount: formatCurrency(invoice.amount),
      name: invoice.customers.name,
      image_url: invoice.customers.image_url,
      email: invoice.customers.email,
      id: invoice.id
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const [
      { count: invoiceCount },
      { count: customerCount },
      { data: invoiceStatus }
    ] = await Promise.all([
      supabase.from('invoices').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('invoices').select(`
        status,
        amount
      `)
    ]);

    const paid = invoiceStatus?.reduce((sum, invoice) => 
      invoice.status === 'paid' ? sum + invoice.amount : sum, 0) ?? 0;
    const pending = invoiceStatus?.reduce((sum, invoice) =>
      invoice.status === 'pending' ? sum + invoice.amount : sum, 0) ?? 0;

    return {
      numberOfCustomers: customerCount ?? 0,
      numberOfInvoices: invoiceCount ?? 0,
      totalPaidInvoices: formatCurrency(paid),
      totalPendingInvoices: formatCurrency(pending),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id,
        amount,
        date,
        status,
        customers (
          name,
          email,
          image_url
        )
      `)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,amount.ilike.%${query}%,date.ilike.%${query}%,status.ilike.%${query}%`)
      .order('date', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) throw error;

    return invoices.map(invoice => ({
      ...invoice,
      name: invoice.customers.name,
      email: invoice.customers.email,
      image_url: invoice.customers.image_url
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,amount.ilike.%${query}%,date.ilike.%${query}%,status.ilike.%${query}%`);

    if (error) throw error;

    const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        id,
        customer_id,
        amount,
        status
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      amount: data.amount / 100,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name')
      .order('name');

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_customer_summary', { search_query: `%${query}%` });

    if (error) throw error;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
