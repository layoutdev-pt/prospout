import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createReadOnlyClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import SettingsContent from '@/components/SettingsContent';

export default async function SettingsPage() {
  const cookieStore = cookies();
  const supabase = createReadOnlyClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <SettingsContent />
      </main>
    </div>
  );
}
