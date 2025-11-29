"use client";
import { useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import Turnstile from './Turnstile';

const supabase = getBrowserSupabaseClient();

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken: captchaToken || undefined,
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (data.user?.identities?.length === 0) {
        setMessage('Check your email to confirm your account.');
      } else {
        setMessage('Account created. Redirecting...');
        setTimeout(()=>{ window.location.href = '/dashboard'; }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 rounded-xl bg-slate-900/40 border border-slate-700/40 text-white">
      <h2 className="text-xl font-semibold mb-4">Create Account</h2>
      <form onSubmit={submit} className="space-y-3">
        <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm" />
        <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm" />
        <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm" />
        <div className="mt-2">
          <Turnstile onToken={setCaptchaToken} />
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}
        {message && <div className="text-xs text-emerald-400">{message}</div>}
        <button disabled={loading} className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">{loading? 'Creating…' : 'Create account'}</button>
      </form>
    </div>
  );
}

