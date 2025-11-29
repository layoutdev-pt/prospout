import Link from 'next/link';
import { LayoutDashboard, Building, User, Brain, Camera } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-16 text-white">
        <div className="rounded-2xl p-10 bg-slate-900/40 border border-slate-800/40 backdrop-blur">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">Growth KPIs for Creators & Agencies</h1>
          <p className="mt-3 text-slate-300 text-sm md:text-base">Plan content, analyze performance, and track conversions in one place.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 font-semibold">Get Started</Link>
            <Link href="/signup" className="px-5 py-3 rounded-lg bg-slate-800/60 border border-slate-700/60">Sign Up</Link>
          </div>
        </div>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard" className="card hover:shadow-md">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium">Open Dashboard</h3>
            </div>
            <p className="text-sm text-slate-500">KPIs, conversion calculator, and insights.</p>
          </Link>

          <Link href="/pipelines/COMPANIES" className="card hover:shadow-md">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium">Companies Pipeline</h3>
            </div>
          </Link>

          <Link href="/pipelines/INFLUENCERS" className="card hover:shadow-md">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium">Influencers Pipeline</h3>
            </div>
          </Link>
        </section>

        <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/analysis" className="card hover:shadow-md">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium">AI Analytics</h3>
            </div>
            <p className="text-sm text-slate-500">Brain-powered insights and content scoring.</p>
          </Link>
          <Link href="/content" className="card hover:shadow-md">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium">Content Planner</h3>
            </div>
            <p className="text-sm text-slate-500">Plan, schedule, and track performance.</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
