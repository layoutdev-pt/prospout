"use client";
import { useRouter } from 'next/navigation';
import { Zap, Sparkles } from 'lucide-react';

interface AnalyzeButtonProps {
  context?: string;
  className?: string;
  label?: string;
}

export default function AnalyzeButton({ context, className = '', label = 'Analyze with AI' }: AnalyzeButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // In a real app, we might pass context via URL params or state
    router.push('/analysis');
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg font-medium shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95 ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
