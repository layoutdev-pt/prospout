import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Prospout — Commercial Ops</h1>
        <p className="text-slate-600">Internal pipeline tracking for Layout Agency</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard" className="card hover:shadow-md">
          <h3 className="font-medium">Open Dashboard</h3>
          <p className="text-sm text-slate-500">View companies, influencers, and combined analytics.</p>
        </Link>

        <Link href="/pipelines/COMPANIES" className="card hover:shadow-md">
          <h3 className="font-medium">Companies Pipeline</h3>
        </Link>

        <Link href="/pipelines/INFLUENCERS" className="card hover:shadow-md">
          <h3 className="font-medium">Influencers Pipeline</h3>
        </Link>
      </section>
    </div>
  );
}
