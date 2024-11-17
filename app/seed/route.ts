import bcrypt from 'bcrypt';
import { supabase } from '../lib/supabase';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
  // Create users table
  const { error: createError } = await supabase.rpc('create_uuid_extension');
  
  const { error: tableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  // Insert users
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            id: user.id,
            name: user.name,
            email: user.email,
            password: hashedPassword
          }
        ], { onConflict: 'id' });
      return error;
    })
  );

  return insertedUsers;
}

async function seedInvoices() {
  // Create invoices table
  const { error: tableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  // Insert invoices
  const insertedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      const { error } = await supabase
        .from('invoices')
        .upsert([
          {
            customer_id: invoice.customer_id,
            amount: invoice.amount,
            status: invoice.status,
            date: invoice.date
          }
        ], { onConflict: 'id' });
      return error;
    })
  );

  return insertedInvoices;
}

async function seedCustomers() {
  // Create customers table
  const { error: tableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  // Insert customers
  const insertedCustomers = await Promise.all(
    customers.map(async (customer) => {
      const { error } = await supabase
        .from('customers')
        .upsert([
          {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            image_url: customer.image_url
          }
        ], { onConflict: 'id' });
      return error;
    })
  );

  return insertedCustomers;
}

async function seedRevenue() {
  // Create revenue table
  const { error: tableError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  // Insert revenue
  const insertedRevenue = await Promise.all(
    revenue.map(async (rev) => {
      const { error } = await supabase
        .from('revenue')
        .upsert([
          {
            month: rev.month,
            revenue: rev.revenue
          }
        ], { onConflict: 'month' });
      return error;
    })
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    // Start transaction
    const { error: beginError } = await supabase.rpc('begin_transaction');
    
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    
    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    // Rollback transaction
    const { error: rollbackError } = await supabase.rpc('rollback_transaction');
    return Response.json({ error }, { status: 500 });
  }
}
