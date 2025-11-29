"use client";
import { useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import Turnstile from './Turnstile';

const supabase = getBrowserSupabaseClient();

export default function EmailLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: captchaToken || undefined },
      });
      if (error) throw error;
      if (!data.session) throw new Error('Login failed');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Email & Password</h3>
      {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <p className="text-xs text-orange-400 mb-2">Captcha not configured. Email login may fail if Captcha is enabled in Supabase.</p>
      )}
      <form onSubmit={submit} className="space-y-3">
        <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm" />
        <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm" />
        <div className="mt-2">
          <Turnstile onToken={setCaptchaToken} />
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}
        <button disabled={loading} className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">{loading? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

