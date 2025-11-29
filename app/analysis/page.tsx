import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createReadOnlyClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import AIAnalysisWorkbench from '@/components/AI/AIAnalysisWorkbench';

export default async function AnalysisPage() {
  const cookieStore = cookies();
  const supabase = createReadOnlyClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AIAnalysisWorkbench />
      </main>
    </div>
  );
}
