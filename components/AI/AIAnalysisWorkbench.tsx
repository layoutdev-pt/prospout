"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileText, Mic, MessageSquare, Mail, PhoneCall, Gauge, Download, ChevronDown, CheckCircle, AlertCircle, Loader2, Play, File as FileIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import AIGauge from './AIGauge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Cell } from 'recharts';

type Channel = 'R1' | 'R2' | 'R3' | 'Cold Call' | 'Cold Email' | 'Cold DM' | 'Fireflies';

type InputItem = {
  id: string;
  channel: Channel;
  filename?: string;
  text?: string;
  inlineData?: { data: string; mimeType: string };
  type: 'text' | 'file' | 'url';
  url?: string;
};

type AnalysisItem = {
  id: string;
  channel: Channel;
  summary: string;
  sentiment: 'positive'|'neutral'|'negative';
  objections: string[];
  score: number; // 0..100
  suggestions: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  scoringBreakdown: Array<{ criteria: string; score: number; max: number; reason: string }>;
  keyPoints?: string[];
  actionItems?: string[];
  engagementAnalysis?: string;
  negotiationOpportunities?: string[];
};

const CHANNEL_OPTIONS: { value: Channel; label: string; icon: any; accept: string }[] = [
  { value: 'R1', label: 'R1 (Discovery)', icon: PhoneCall, accept: 'audio/*,video/*,.txt,.csv' },
  { value: 'R2', label: 'R2 (Follow Up)', icon: PhoneCall, accept: 'audio/*,video/*,.txt,.csv' },
  { value: 'R3', label: 'R3 (Q&A)', icon: PhoneCall, accept: 'audio/*,video/*,.txt,.csv' },
  { value: 'Cold Call', label: 'Cold Call', icon: Mic, accept: 'audio/*,.txt' },
  { value: 'Cold Email', label: 'Cold Email', icon: Mail, accept: '.pdf,.doc,.docx,.txt' },
  { value: 'Cold DM', label: 'Cold DM', icon: MessageSquare, accept: '.txt,.pdf,.doc,.docx' },
  { value: 'Fireflies', label: 'Fireflies.ai Link', icon: Play, accept: 'url' },
];

export default function AIAnalysisWorkbench() {
  const { t } = useTranslation();
  const [selectedChannel, setSelectedChannel] = useState<Channel>('R1');
  const [inputs, setInputs] = useState<InputItem[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisItem[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement|null>(null);
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const activeResult = useMemo(() => results.find(r => r.id === activeResultId) || results[0], [results, activeResultId]);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;
    
    const newInputs: InputItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).slice(2);
      
      // Max 100MB
      if (file.size > 100 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 100MB limit.`);
        continue;
      }

      try {
        if (selectedChannel === 'R1' || selectedChannel === 'R2' || selectedChannel === 'R3' || selectedChannel === 'Cold Call') {
          const isVideoOrAudio = file.type.startsWith('video/') || file.type.startsWith('audio/');
          if (!isVideoOrAudio && !file.type.startsWith('text/')) {
            alert(`Unsupported file type for ${selectedChannel}: ${file.type}`);
            continue;
          }
          if (file.type.startsWith('video/')) {
            const ok = await validateVideoResolution(file);
            if (!ok) {
              alert('Video resolution must be between 480p and 4K.');
              continue;
            }
          }
        }
        if (selectedChannel === 'Cold Email') {
          const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];
          if (!allowed.includes(file.type)) {
            alert(`Unsupported email attachment type: ${file.type}`);
            continue;
          }
        }
        if (selectedChannel === 'Cold DM') {
          const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','image/jpeg','image/png'];
          if (!allowed.includes(file.type)) {
            alert(`Unsupported DM attachment type: ${file.type}`);
            continue;
          }
        }

        if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.md')) {
           const text = await file.text();
           newInputs.push({
             id,
             channel: selectedChannel,
             filename: file.name,
             text,
             type: 'file'
           });
        } else {
          // Handle binary files (Audio, Video, PDF, DOC, Images)
          const { data, mimeType } = await fileToBase64(file);
          await uploadToServer(file, selectedChannel, id);
          newInputs.push({
            id,
            channel: selectedChannel,
            filename: file.name,
            inlineData: { data, mimeType },
            type: 'file'
          });
        }
      } catch (e) {
        console.error("Error reading file", file.name, e);
        alert(`Error reading file ${file.name}`);
      }
    }
    
    setInputs(prev => [...prev, ...newInputs]);
  };

  const uploadToServer = (file: File, channel: Channel, id: string) => {
    return new Promise<void>((resolve, reject) => {
      const form = new FormData();
      form.append('file', file);
      form.append('channel', channel);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/uploads');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({ ...prev, [id]: pct }));
        }
      };
      xhr.onload = () => {
        setUploadProgress(prev => ({ ...prev, [id]: 100 }));
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.send(form);
    });
  };

  const validateVideoResolution = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        URL.revokeObjectURL(url);
        const minOk = w >= 640 && h >= 480;
        const maxOk = w <= 3840 && h <= 2160;
        resolve(minOk && maxOk);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      video.src = url;
    });
  };

  const addTextInput = () => {
    if (!inputText.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setInputs(prev => [...prev, {
      id,
      channel: selectedChannel,
      text: inputText,
      type: 'text',
      filename: 'Text Input'
    }]);
    setInputText('');
  };

  const addUrlInput = () => {
    if (!inputUrl.trim()) return;
    
    // Basic Fireflies URL validation
    if (selectedChannel === 'Fireflies' && !inputUrl.includes('fireflies.ai')) {
      alert('Please enter a valid Fireflies.ai link (e.g., https://app.fireflies.ai/view/...)');
      return;
    }

    const id = Math.random().toString(36).slice(2);
    setInputs(prev => [...prev, {
      id,
      channel: selectedChannel,
      text: `Fireflies Recording Link: ${inputUrl}`, // Pass as text for now
      type: 'url',
      filename: 'Fireflies Link',
      url: inputUrl
    }]);
    setInputUrl('');
  };

  const removeInput = (id: string) => {
    setInputs(prev => prev.filter(i => i.id !== id));
  };

  const runAnalysis = async () => {
    if (inputs.length === 0) return;
    setRunning(true);
    setProgress(10);
    setResults([]);
    setActiveResultId(null);

    try {
      const payload = {
        items: inputs.map(i => ({
          channel: i.channel,
          text: i.text,
          inlineData: i.inlineData
        }))
      };

      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setProgress(60);

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      setProgress(90);
      setResults(data.items || []);
      if (data.items && data.items.length > 0) {
        setActiveResultId(data.items[0].id);
      }
      setProgress(100);
    } catch (e) {
      console.error('AI analysis failed', e);
      alert('Analysis failed. Please try again.');
    } finally {
      setRunning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const fileToBase64 = (file: File): Promise<{data: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [meta, data] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        resolve({ data, mimeType });
      };
      reader.onerror = error => reject(error);
    });
  };

  const currentOption = CHANNEL_OPTIONS.find(o => o.value === selectedChannel) || CHANNEL_OPTIONS[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">AI Analytics Engine</h1>
        <p className="text-slate-400 text-sm mt-1">Advanced multi-modal analysis powered by Gemini</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input Configuration */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Input Selection Interface */}
          <div className="card bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">1</span>
              Select Input Type
            </h2>
            
            <div className="relative">
              <select 
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as Channel)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              >
                {CHANNEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs text-slate-400">
              <div className="font-medium text-slate-300 mb-1">Supported formats:</div>
              {currentOption.accept.split(',').join(', ')}
            </div>
          </div>

          {/* 2. Input Upload/Entry */}
          <div className="card bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">2</span>
              Add Content
            </h2>

            <div className="flex gap-2 mb-4">
               <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                 <Upload className="w-4 h-4" /> Upload File
               </button>
               <input 
                 ref={fileInputRef} 
                 type="file" 
                 multiple 
                 accept={currentOption.accept} 
                 className="hidden" 
                 onChange={(e) => handleFileChange(e.target.files)} 
               />
            </div>

            <div className="relative">
              {currentOption.accept === 'url' ? (
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste Fireflies.ai link here..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  <button 
                    onClick={addUrlInput}
                    disabled={!inputUrl.trim()}
                    className="px-3 py-2 bg-cyan-600 text-xs rounded hover:bg-cyan-500 disabled:opacity-50 whitespace-nowrap"
                  >
                    Add Link
                  </button>
                </div>
              ) : (
                <>
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Or paste text here..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm min-h-[100px] focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  <button 
                    onClick={addTextInput}
                    disabled={!inputText.trim()}
                    className="absolute bottom-2 right-2 px-2 py-1 bg-cyan-600 text-xs rounded hover:bg-cyan-500 disabled:opacity-50"
                  >
                    Add Text
                  </button>
                </>
              )}
            </div>

            {/* Input List */}
            <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
              {inputs.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/30 group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {item.type === 'file' ? <FileIcon className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4 text-purple-400" />}
                    <div className="flex flex-col overflow-hidden">
                       <span className="text-sm truncate">{item.filename}</span>
                       <span className="text-[10px] text-slate-500 uppercase">{item.channel}</span>
                    </div>
                  </div>
                  {uploadProgress[item.id] !== undefined && (
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-cyan-500" style={{ width: `${uploadProgress[item.id]}%` }} />
                    </div>
                  )}
                  <button onClick={() => removeInput(item.id)} className="text-slate-500 hover:text-red-400">
                    <span className="sr-only">Remove</span>
                    &times;
                  </button>
                </div>
              ))}
              {inputs.length === 0 && <div className="text-center text-xs text-slate-500 py-2">No inputs added yet</div>}
            </div>

            <button 
              onClick={runAnalysis} 
              disabled={running || inputs.length === 0}
              className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg font-bold shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {running ? 'Analyzing...' : 'Run Analysis'}
            </button>

            {running && (
              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results Display */}
        <div className="lg:col-span-2 space-y-6">
          {!activeResult ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-slate-500">
               <Gauge className="w-16 h-16 mb-4 opacity-20" />
               <p>Run an analysis to see results here</p>
             </div>
          ) : (
            <>
              {/* Result Navigation (if multiple) */}
              {results.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {results.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => setActiveResultId(r.id)}
                      className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition-colors ${activeResultId === r.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                    >
                      {r.channel} ({r.score}%)
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Card */}
                <div className="card bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
                   <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Performance Score</h3>
                   <div className="w-48">
                     <AIGauge value={activeResult.score} label={`${activeResult.score}`} subtitle={activeResult.sentiment.toUpperCase()} />
                   </div>
                </div>

                {/* Monitor Graph */}
                <div className="card bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Scoring Breakdown</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeResult.scoringBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="criteria" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                          cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                          {activeResult.scoringBreakdown?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#22d3ee' : entry.score > 40 ? '#fbbf24' : '#f87171'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Summary & Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Analysis Summary
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{activeResult.summary}</p>
                  
                  {activeResult.keyPoints && activeResult.keyPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Key Discussion Points</h4>
                      <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                        {activeResult.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                      </ul>
                    </div>
                  )}

                  {activeResult.actionItems && activeResult.actionItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Action Items</h4>
                      <ul className="list-decimal list-inside text-slate-300 text-xs space-y-1">
                        {activeResult.actionItems.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Key Objections / Challenges</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeResult.objections.length > 0 ? (
                        activeResult.objections.map((obj, i) => (
                          <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-md">
                            {obj}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs italic">No objections detected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Strategic Suggestions
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {activeResult.suggestions?.map((sugg, i) => (
                      <div key={i} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-cyan-200 text-sm">{sugg.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                            sugg.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                            sugg.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                            'bg-blue-500/20 text-blue-400'
                          }`}>{sugg.priority}</span>
                        </div>
                        <p className="text-xs text-slate-400">{sugg.description}</p>
                      </div>
                    ))}
                    {(!activeResult.suggestions || activeResult.suggestions.length === 0) && (
                      <div className="text-slate-500 text-sm italic">No specific suggestions generated.</div>
                    )}

                    {activeResult.negotiationOpportunities && activeResult.negotiationOpportunities.length > 0 && (
                       <div className="mt-4 pt-4 border-t border-slate-700/30">
                         <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Negotiation Opportunities</h4>
                         <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                           {activeResult.negotiationOpportunities.map((op, i) => <li key={i}>{op}</li>)}
                         </ul>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
