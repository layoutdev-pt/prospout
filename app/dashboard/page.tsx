import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createReadOnlyClient } from '@/lib/supabase/server';
import Dashboard from '@/components/Dashboard';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createReadOnlyClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return <Dashboard />;
}
