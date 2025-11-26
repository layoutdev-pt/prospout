"use client";
import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

const ITEMS: { q: string; a: string }[] = [
  { q: 'Cold calls made', a: 'Total number of outbound calls attempted.' },
  { q: 'Cold calls answered', a: 'Calls where the lead actually picked up.' },
  { q: 'Meetings scheduled via cold call (R1)', a: 'First meetings booked immediately after a cold call.' },
  { q: 'Cold DMs sent', a: 'Direct messages sent as first contact.' },
  { q: 'Cold DMs responded', a: 'DMs where the prospect replied.' },
  { q: 'Meetings scheduled via DM (R1)', a: 'R1 meetings booked through direct messages.' },
  { q: 'Emails sent', a: 'Outbound outreach emails sent directly to leads.' },
  { q: 'Emails opened & replied', a: 'Emails where leads opened AND replied.' },
  { q: 'Discovery meeting (R1)', a: 'The first qualifying meeting where needs and goals are discussed.' },
  { q: 'Follow-up meeting (R2)', a: 'Second meeting to review proposal elements or clarify details.' },
  { q: 'Q&A meeting (R3)', a: 'Final meeting to resolve objections before signing.' },
  { q: 'Verbal agreement', a: 'Prospect verbally agrees to close but has not signed yet.' },
  { q: 'Deal closed', a: 'Client formally signs or pays.' },
  { q: 'Time to cash (days)', a: 'Number of days between the first contact and receiving payment.' },
];

export default function FAQ() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="group relative sticky top-8">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
      <div className="relative card bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition">
        <h3 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Definitions & FAQ
        </h3>
        <div className="space-y-2">
          {ITEMS.map((item, i) => (
            <div key={i} className="border border-slate-700/50 rounded-lg overflow-hidden hover:border-emerald-500/50 transition">
              <button
                onClick={() => setExpanded(expanded === item.q ? null : item.q)}
                className="w-full text-left px-4 py-3 bg-slate-800/30 hover:bg-slate-800/60 font-medium text-sm text-slate-300 flex justify-between items-center transition"
              >
                {item.q}
                <ChevronDown className={`w-4 h-4 transition transform ${expanded === item.q ? 'rotate-180' : ''}`} />
              </button>
              {expanded === item.q && (
                <div className="px-4 py-3 text-sm text-slate-400 bg-slate-900/30 border-t border-slate-700/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
