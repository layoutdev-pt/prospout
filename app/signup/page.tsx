'use client';
import Signup from '@/components/Auth/Signup';
import { useEffect } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabase = getBrowserSupabaseClient();

export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session) router.push('/dashboard');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Signup />
    </div>
  );
}
