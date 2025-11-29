"use client";
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ResetButton() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleReset() {
    if (!confirm(t('Are you sure you want to reset all statistics to zero?'))) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        alert(t('Statistics reset to zero'));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert(t('Error resetting'));
    }
    setLoading(false);
  }

  return (
    <button 
      onClick={handleReset} 
      disabled={loading}
      className="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 transition disabled:opacity-50"
    >
      {loading ? t('Resetting...') : t('Reset Stats')}
    </button>
  );
}
