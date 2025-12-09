import { useState, useRef, useEffect } from 'react';
import { 
  Activity, AlertTriangle, FileText, Sparkles, TrendingUp, Send, X, Loader2, MessageSquare,
  ChevronRight, Download, DollarSign, Clock, Play, RefreshCw, Building2, Shield,
  BarChart3, Zap, Target, Scale
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, CartesianGrid, 
  Tooltip, ComposedChart, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Payer {
  id: string;
  name: string;
  short: string;
  revenue: number;
  yieldGap: number;
  velocity: number;
  contract: number;
  risk: 'critical' | 'elevated' | 'stable';
  rec: string;
  alert: boolean;
  expires: string;
}

interface CFOResponse {
  financial_impact: { revenue_at_risk: string; ytd_impact: string; trend_or_recovery: string };
  root_cause: { primary_cause: string; contributing_factors: string[]; evidence: string };
  contract_implication?: { section_reference: string; violation_type: string; legal_standing: string };
  recommended_actions: { immediate: string; short_term: string; strategic: string };
  sources: { data_sources: string[]; documents: string[]; knowledge_graph?: string[] };
  confidence: number;
  last_data_update: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  structured?: {
    financial: { risk: string; ytd: string; trend: string };
    cause: string;
    factors: string[];
    contract: { section: string; violation: string };
    actions: { immediate: string; short: string; strategic: string };
    confidence: number;
  };
  response?: CFOResponse;
}

const PAYERS: Payer[] = [
  { id: 'uhc', name: 'UnitedHealthcare MA', short: 'UHC MA', revenue: 523, yieldGap: -16.7, velocity: 38, contract: 30, risk: 'critical', rec: 'Escalate', alert: true, expires: 'Jun 2025' },
  { id: 'humana', name: 'Humana MA', short: 'Humana', revenue: 412, yieldGap: -18.2, velocity: 42, contract: 30, risk: 'critical', rec: 'Terminate?', alert: false, expires: 'Dec 2025' },
  { id: 'bcbs', name: 'Florida Blue', short: 'FL Blue', revenue: 287, yieldGap: -8.4, velocity: 28, contract: 30, risk: 'elevated', rec: 'Negotiate', alert: false, expires: 'Mar 2026' },
  { id: 'aetna', name: 'Aetna', short: 'Aetna', revenue: 198, yieldGap: -6.2, velocity: 32, contract: 30, risk: 'elevated', rec: 'Monitor', alert: false, expires: 'Sep 2025' },
  { id: 'cigna', name: 'Cigna', short: 'Cigna', revenue: 156, yieldGap: -2.1, velocity: 29, contract: 30, risk: 'stable', rec: 'Maintain', alert: false, expires: 'Jan 2027' },
  { id: 'medicare', name: 'Traditional Medicare', short: 'Medicare', revenue: 892, yieldGap: 1.2, velocity: 14, contract: 14, risk: 'stable', rec: 'Maintain', alert: false, expires: 'N/A' },
];

const FORECAST = [
  { week: 'W1', value: 48, low: 46, high: 51 },
  { week: 'W2', value: 51, low: 48, high: 54 },
  { week: 'W3', value: 52, low: 49, high: 56 },
  { week: 'W4', value: 54, low: 50, high: 58 },
  { week: 'W5', value: 52, low: 48, high: 57 },
  { week: 'W6', value: 53, low: 48, high: 58 },
];

const DENIALS = [
  { name: 'Prior Auth', value: 8.2, color: '#ef4444' },
  { name: 'Med Necessity', value: 9.4, color: '#f59e0b' },
  { name: 'Coding', value: 4.1, color: '#8b5cf6' },
  { name: 'Timely Filing', value: 3.1, color: '#64748b' },
];

const YIELD_TREND = [
  { m: 'Jan', v: 79 }, { m: 'Feb', v: 78 }, { m: 'Mar', v: 78 },
  { m: 'Apr', v: 77 }, { m: 'May', v: 77 }, { m: 'Jun', v: 76 },
];

const VELOCITY_TREND = [
  { m: 'Jul', d: 32 }, { m: 'Aug', d: 34 }, { m: 'Sep', d: 35 },
  { m: 'Oct', d: 36 }, { m: 'Nov', d: 37 }, { m: 'Dec', d: 38 },
];

const CARC_CODES = [
  { code: 'CO-4', amount: 3.2 },
  { code: 'CO-197', amount: 2.8 },
  { code: 'CO-50', amount: 1.4 },
  { code: 'CO-29', amount: 0.7 },
];

export default function App() {
  const [tab, setTab] = useState('summary');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState('uhc');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className={chatOpen ? 'mr-[400px]' : ''}>
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Payer Intelligence</h1>
                  <p className="text-xs text-slate-500">835/837 + GraphRAG</p>
                </div>
              </div>
              <nav className="flex bg-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => setTab('summary')}
                  className={`px-4 py-2 rounded text-sm font-medium ${tab === 'summary' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  CFO Summary
                </button>
                <button 
                  onClick={() => setTab('analysis')}
                  className={`px-4 py-2 rounded text-sm font-medium ${tab === 'analysis' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  Deep Analysis
                </button>
              </nav>
            </div>
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${chatOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              <Sparkles className="w-4 h-4" />
              {chatOpen ? 'Hide Chat' : 'Ask Intelligence'}
            </button>
          </div>
        </header>

        <main className="p-6">
          {tab === 'summary' ? (
            <SummaryTab onPayerSelect={(id) => { setSelectedPayer(id); setTab('analysis'); }} />
          ) : (
            <AnalysisTab selectedPayer={selectedPayer} onPayerChange={setSelectedPayer} />
          )}
        </main>
      </div>

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} selectedPayerId={selectedPayer} />}
    </div>
  );
}

function SummaryTab({ onPayerSelect }: { onPayerSelect: (id: string) => void }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Critical Alert */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded-full">CRITICAL</span>
              <span className="text-sm font-semibold text-red-400">UnitedHealthcare MA</span>
            </div>
            <p className="text-white">Policy change detected. Revenue leakage forecast to increase from 24.8% to 28.5% in 30 days.</p>
            <p className="text-red-300/80 text-sm mt-1">Impact: $2.4M/month additional revenue loss</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Executive Summary</h2>
              <p className="text-xs text-slate-500">Auto-generated Dec 9, 2025 6:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center"><p className="text-2xl font-bold text-red-400">2</p><p className="text-xs text-slate-500">Critical</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-amber-400">2</p><p className="text-xs text-slate-500">Elevated</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-cyan-400">3</p><p className="text-xs text-slate-500">Changes</p></div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <p className="text-slate-300 leading-relaxed">
            Your payer portfolio has 2 critical and 2 elevated risk payers requiring attention. 
            The 12-week cash forecast projects <span className="text-white font-semibold">$630M</span> (range: $523M-$737M at 80% confidence). 
            Three policy changes detected in the past 7 days.
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
            <span className="text-xs text-slate-500">Top Recommendation:</span>
            <span className="text-sm font-medium text-cyan-400">Escalate UHC MA, schedule Humana termination review</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Payer Portfolio */}
        <div className="col-span-5 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Payer Portfolio</h3>
            <span className="text-xs text-slate-500">6 payers</span>
          </div>
          <div className="space-y-2">
            {PAYERS.map(p => (
              <button 
                key={p.id}
                onClick={() => onPayerSelect(p.id)}
                className={`w-full text-left p-3 rounded-lg border hover:border-cyan-500/50 transition ${
                  p.risk === 'critical' ? 'border-red-500/50 bg-red-500/5' :
                  p.risk === 'elevated' ? 'border-amber-500/50 bg-amber-500/5' :
                  'border-slate-600 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {p.alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      <span className="font-semibold">{p.short}</span>
                      <StatusBadge status={p.risk} />
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-slate-400">${p.revenue}M</span>
                      <span className={p.yieldGap < -10 ? 'text-red-400' : p.yieldGap < -5 ? 'text-amber-400' : 'text-emerald-400'}>
                        {p.yieldGap > 0 ? '+' : ''}{p.yieldGap}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-cyan-400 block mt-1">{p.rec}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-7 space-y-6">
          {/* Cash Forecast */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">12-Week Cash Forecast</h3>
                <p className="text-xs text-slate-500">80% confidence interval</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold font-mono">$630M</p>
                <p className="text-sm text-slate-400">Range: $523M - $737M</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+4.2% vs Q3</span>
                </div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={FORECAST}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[40, 60]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="high" stroke="none" fill="#06b6d4" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="low" stroke="none" fill="#0f172a" />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Downloads */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-lg font-semibold mb-4">Ready to Download</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Board Presentation', 'Payer Scorecards (6)', 'UHC Negotiation Brief', 'Humana Analysis'].map((title, i) => (
                <button key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/50 transition group text-left">
                  <div className="p-2 bg-slate-700 rounded-lg group-hover:bg-cyan-500/20">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{title}</p>
                    <p className="text-xs text-slate-500">Dec 9, 2025</p>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Intelligence Status</span>
            </div>
            <span><span className="text-slate-500">Last:</span> Today 3:45 AM</span>
          </div>
          <div className="flex items-center gap-6">
            <span><span className="text-slate-500">Models:</span> <span className="text-emerald-400">6/6</span></span>
            <span><span className="text-slate-500">Accuracy:</span> 94.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MonteCarloResult {
  pessimistic: { scenario: string; net_impact: number; retention: number; break_even: string };
  expected: { scenario: string; net_impact: number; retention: number; break_even: string };
  optimistic: { scenario: string; net_impact: number; retention: number; break_even: string };
  favorable_probability: number;
  recommendation: string;
  compute_time_ms: number;
  compute_type: string;
}

function AnalysisTab({ selectedPayer, onPayerChange }: { selectedPayer: string; onPayerChange: (id: string) => void }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const payer = PAYERS.find(p => p.id === selectedPayer) || PAYERS[0];

  const runAnalysis = async () => {
    setRunning(true);
    setProgress(0);
    setMonteCarloResult(null);
    
    try {
      // Start Monte Carlo simulation
      const startResponse = await fetch(`${API_URL}/api/monte-carlo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer_id: selectedPayer, num_simulations: 1000, use_gpu: false })
      });
      const { job_id } = await startResponse.json();
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${API_URL}/api/monte-carlo/${job_id}`);
          const result = await statusResponse.json();
          setProgress(result.progress || 0);
          
          if (result.status === 'completed') {
            clearInterval(pollInterval);
            setMonteCarloResult(result);
            setRunning(false);
          } else if (result.status === 'failed') {
            clearInterval(pollInterval);
            setRunning(false);
            console.error('Monte Carlo failed:', result.error);
          }
        } catch (err) {
          console.error('Error polling Monte Carlo:', err);
        }
      }, 500);
    } catch (err) {
      console.error('Error starting Monte Carlo:', err);
      setRunning(false);
    }
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${value >= 0 ? '+' : '-'}$${(absValue / 1000000).toFixed(1)}M`;
    }
    return `${value >= 0 ? '+' : '-'}$${(absValue / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-400">Select Payer:</label>
          <select 
            value={selectedPayer} 
            onChange={(e) => onPayerChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            {PAYERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg font-medium">
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Analysis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Payer Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-700 rounded-xl">
              <Building2 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{payer.name}</h1>
                <StatusBadge status={payer.risk} />
              </div>
              <p className="text-slate-400 mt-1">Medicare Advantage - Expires {payer.expires}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold font-mono">${payer.revenue}M</p>
              <p className="text-xs text-slate-500">Annual Revenue</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold font-mono ${payer.yieldGap < -10 ? 'text-red-400' : payer.yieldGap < -5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {payer.yieldGap > 0 ? '+' : ''}{payer.yieldGap}%
              </p>
              <p className="text-xs text-slate-500">Yield Gap</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold font-mono">{payer.velocity}d</p>
              <p className="text-xs text-slate-500">Cash Velocity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {running && (
        <div className="bg-slate-800/50 rounded-xl border border-cyan-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Analysis Progress</span>
            <span className="text-slate-400">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Metrics Row 1 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Yield Analysis */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Yield Analysis</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><p className="text-xs text-slate-500">Current Yield</p><p className="text-2xl font-bold font-mono">76.3%</p></div>
            <div><p className="text-xs text-slate-500">Contracted</p><p className="text-2xl font-bold font-mono text-slate-400">93.0%</p></div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Yield Gap</span>
              <span className="text-lg font-bold font-mono text-red-400">-16.7%</span>
            </div>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={YIELD_TREND}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                <YAxis domain={[70, 85]} hide />
                <ReferenceLine y={93} stroke="#22c55e" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Denial Breakdown */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Revenue Leakage</h3>
            <span className="text-2xl font-bold text-red-400 font-mono">24.8%</span>
          </div>
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DENIALS} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                  {DENIALS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1">
            {DENIALS.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-mono">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Velocity */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Cash Velocity</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><p className="text-xs text-slate-500">Current</p><p className="text-2xl font-bold font-mono text-red-400">{payer.velocity}d</p></div>
            <div><p className="text-xs text-slate-500">Contracted</p><p className="text-2xl font-bold font-mono text-slate-400">{payer.contract}d</p></div>
          </div>
          {payer.velocity > payer.contract && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">{payer.velocity - payer.contract}d over contract</span>
              </div>
            </div>
          )}
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VELOCITY_TREND}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                <YAxis domain={[0, 50]} hide />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                <Bar dataKey="d" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metrics Row 2 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Forecast */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">30/60 Day Forecast</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Revenue Leakage</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">30 days</p>
                  <p className="text-lg font-bold font-mono">28.5%</p>
                  <p className="text-xs font-mono text-red-400">+3.7%</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">60 days</p>
                  <p className="text-lg font-bold font-mono">31.2%</p>
                  <p className="text-xs font-mono text-red-400">+6.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Changes */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Policy Changes</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status="critical" />
                <span className="text-xs text-slate-500">Nov 15</span>
              </div>
              <p className="text-sm font-medium">Observation Policy</p>
              <p className="text-xs text-slate-400 mt-1">Confidence: 94%</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status="elevated" />
                <span className="text-xs text-slate-500">Oct 22</span>
              </div>
              <p className="text-sm font-medium">Prior Auth Requirement</p>
              <p className="text-xs text-slate-400 mt-1">Confidence: 87%</p>
            </div>
          </div>
        </div>

        {/* Patterns */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Patterns Detected</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="critical" />
                <span className="text-sm font-medium">Observation Downgrade</span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-400">Confidence: 96%</span>
                <span className="text-red-400 font-mono">$2.1M/mo</span>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="elevated" />
                <span className="text-sm font-medium">ED Bundling</span>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-400">Confidence: 82%</span>
                <span className="text-amber-400 font-mono">$0.9M/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Termination Analysis */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold">Termination Analysis</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {monteCarloResult ? `${monteCarloResult.compute_type} - ${monteCarloResult.compute_time_ms.toFixed(0)}ms` : '1,000 simulations'}
            </span>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              monteCarloResult?.recommendation === 'CONSIDER TERMINATION' 
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : monteCarloResult?.recommendation === 'NEGOTIATE FIRST'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            }`}>
              {monteCarloResult?.recommendation || 'CONSIDER TERMINATION'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-xs text-slate-500">
                  <th className="text-left pb-2">Scenario</th>
                  <th className="text-right pb-2">Net Impact</th>
                  <th className="text-right pb-2">Retention</th>
                  <th className="text-right pb-2">Break-Even</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 text-red-400">Pessimistic (P10)</td>
                  <td className={`py-3 text-right font-mono ${monteCarloResult?.pessimistic.net_impact && monteCarloResult.pessimistic.net_impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monteCarloResult ? formatCurrency(monteCarloResult.pessimistic.net_impact) : '-$12.4M'}
                  </td>
                  <td className="py-3 text-right font-mono">{monteCarloResult ? `${monteCarloResult.pessimistic.retention}%` : '78%'}</td>
                  <td className="py-3 text-right font-mono">{monteCarloResult?.pessimistic.break_even || '18 mo'}</td>
                </tr>
                <tr className="border-b border-slate-700/50 bg-slate-700/20">
                  <td className="py-3 text-cyan-400 font-medium">Expected (P50)</td>
                  <td className={`py-3 text-right font-mono font-bold ${monteCarloResult?.expected.net_impact && monteCarloResult.expected.net_impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monteCarloResult ? formatCurrency(monteCarloResult.expected.net_impact) : '+$8.2M'}
                  </td>
                  <td className="py-3 text-right font-mono font-bold">{monteCarloResult ? `${monteCarloResult.expected.retention}%` : '86%'}</td>
                  <td className="py-3 text-right font-mono font-bold">{monteCarloResult?.expected.break_even || '6 mo'}</td>
                </tr>
                <tr>
                  <td className="py-3 text-emerald-400">Optimistic (P90)</td>
                  <td className={`py-3 text-right font-mono ${monteCarloResult?.optimistic.net_impact && monteCarloResult.optimistic.net_impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monteCarloResult ? formatCurrency(monteCarloResult.optimistic.net_impact) : '+$24.6M'}
                  </td>
                  <td className="py-3 text-right font-mono">{monteCarloResult ? `${monteCarloResult.optimistic.retention}%` : '92%'}</td>
                  <td className="py-3 text-right font-mono">{monteCarloResult?.optimistic.break_even || 'Immediate'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl font-bold text-cyan-400 font-mono">{monteCarloResult ? `${monteCarloResult.favorable_probability.toFixed(0)}%` : '73%'}</p>
              <p className="text-slate-400 mt-2">Favorable Outcome</p>
              <p className="text-xs text-slate-500 mt-1">1,000 Monte Carlo simulations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Violations + CARC */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Contract Violations</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Section 4.2 - Payment Terms</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <div><span className="text-slate-500">Contract:</span> <span className="font-mono">30d</span></div>
                <div><span className="text-slate-500">Actual:</span> <span className="font-mono text-red-400">38d</span></div>
                <div><span className="text-slate-500">Gap:</span> <span className="font-mono text-red-400">8d</span></div>
              </div>
              <p className="text-xs text-slate-400">Impact: $12.4M delayed</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Section 7.1 - Medical Necessity</span>
              </div>
              <p className="text-sm text-slate-300">Payer applying stricter criteria than contracted.</p>
              <p className="text-xs text-slate-400 mt-1">Impact: $25.2M denied annually</p>
            </div>
          </div>
          <button className="w-full mt-4 py-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium transition">
            Generate Negotiation Brief
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Top CARC Codes</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CARC_CODES} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `$${v}M`} />
                <YAxis type="category" dataKey="code" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={50} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {CARC_CODES.map((_, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : i < 2 ? '#f59e0b' : '#64748b'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Raw Data Summary */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">835/837 Data Summary (Last 30 Days)</h3>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: 'Claims', value: '12,456', source: '837' },
            { label: 'Service Lines', value: '48,234', source: '837' },
            { label: 'Billed', value: '$45.2M', source: '837' },
            { label: 'Paid', value: '$34.5M', source: '835' },
            { label: 'Denied', value: '$8.7M', source: '835', color: 'red' },
            { label: 'Pending', value: '$2.0M', source: '835', color: 'amber' },
          ].map((m, i) => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">{m.label}</p>
              <p className={`text-xl font-bold font-mono ${m.color === 'red' ? 'text-red-400' : m.color === 'amber' ? 'text-amber-400' : 'text-white'}`}>{m.value}</p>
              <p className="text-xs text-slate-600 mt-1">Source: {m.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ onClose, selectedPayerId }: { onClose: () => void; selectedPayerId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg, payer_id: selectedPayerId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '',
          response: data,
          structured: {
            financial: { 
              risk: data.financial_impact?.revenue_at_risk || '$2.1M/month', 
              ytd: data.financial_impact?.ytd_impact || '$18.4M denied YTD', 
              trend: data.financial_impact?.trend_or_recovery || 'Worsening +3.2%' 
            },
            cause: data.root_cause?.primary_cause || 'Policy change detected affecting observation cases.',
            factors: data.root_cause?.contributing_factors || ['New criteria applied', 'Documentation requirements changed'],
            contract: { 
              section: data.contract_implication?.section_reference || 'Section 7.1 - Medical Necessity', 
              violation: data.contract_implication?.violation_type || 'Payer applying stricter criteria than contracted' 
            },
            actions: { 
              immediate: data.recommended_actions?.immediate || 'Request peer-to-peer reviews', 
              short: data.recommended_actions?.short_term || 'Send contract violation notice', 
              strategic: data.recommended_actions?.strategic || 'Schedule executive meeting' 
            },
            confidence: Math.round((data.confidence || 0.94) * 100)
          }
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request.',
          structured: {
            financial: { risk: '$2.1M/month', ytd: '$18.4M denied YTD', trend: 'Worsening +3.2%' },
            cause: 'UHC updated observation policy (UHC-OBS-2024-001) on November 15, requiring 24-hour documentation threshold.',
            factors: ['New InterQual 2024.2 criteria', 'Physician attestation within 4 hours'],
            contract: { section: 'Section 7.1 - Medical Necessity', violation: 'Contract specifies InterQual 2023.1; payer applying 2024.2' },
            actions: { immediate: 'Request peer-to-peer reviews ($1.8M)', short: 'Send contract violation notice', strategic: 'Schedule executive meeting' },
            confidence: 94
          }
        }]);
      }
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '',
        structured: {
          financial: { risk: '$2.1M/month', ytd: '$18.4M denied YTD', trend: 'Worsening +3.2%' },
          cause: 'UHC updated observation policy (UHC-OBS-2024-001) on November 15, requiring 24-hour documentation threshold.',
          factors: ['New InterQual 2024.2 criteria', 'Physician attestation within 4 hours'],
          contract: { section: 'Section 7.1 - Medical Necessity', violation: 'Contract specifies InterQual 2023.1; payer applying 2024.2' },
          actions: { immediate: 'Request peer-to-peer reviews ($1.8M)', short: 'Send contract violation notice', strategic: 'Schedule executive meeting' },
          confidence: 94
        }
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-slate-900 border-l border-slate-700 flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-semibold">CFO Intelligence</h2>
            <p className="text-xs text-slate-400">835/837 + GraphRAG</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="p-4 bg-slate-800 rounded-2xl mb-4">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ask me anything</h3>
            <p className="text-sm text-slate-400 text-center mb-6">Analyze payers, explain denials, forecast trends</p>
            <div className="w-full space-y-2">
              {["Why is UHC denying observation cases?", "Should we terminate Humana MA?", "What contract violations exist?", "What's driving our yield gap?"].map((q, i) => (
                <button key={i} onClick={() => send(q)} className="w-full text-left text-sm text-cyan-400 bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 hover:border-cyan-500/50">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ) : msg.structured ? (
                <div className="space-y-3">
                  <ChatSection title="FINANCIAL IMPACT" color="blue">
                    <ChatRow label="Revenue at Risk" value={msg.structured.financial.risk} />
                    <ChatRow label="YTD Impact" value={msg.structured.financial.ytd} />
                    <ChatRow label="Trend" value={msg.structured.financial.trend} />
                  </ChatSection>
                  <ChatSection title="ROOT CAUSE" color="slate">
                    <p className="text-sm mb-2">{msg.structured.cause}</p>
                    {msg.structured.factors.map((f, j) => <p key={j} className="text-xs text-slate-400">- {f}</p>)}
                  </ChatSection>
                  <ChatSection title="CONTRACT VIOLATION" color="amber">
                    <p className="text-sm font-medium text-amber-400 mb-1">{msg.structured.contract.section}</p>
                    <p className="text-sm">{msg.structured.contract.violation}</p>
                  </ChatSection>
                  <ChatSection title="RECOMMENDED ACTIONS" color="emerald">
                    <div className="space-y-2">
                      <div><span className="text-xs text-emerald-400 font-semibold">IMMEDIATE</span><p className="text-sm">{msg.structured.actions.immediate}</p></div>
                      <div><span className="text-xs text-emerald-400 font-semibold">SHORT-TERM</span><p className="text-sm">{msg.structured.actions.short}</p></div>
                      <div><span className="text-xs text-emerald-400 font-semibold">STRATEGIC</span><p className="text-sm">{msg.structured.actions.strategic}</p></div>
                    </div>
                  </ChatSection>
                  <div className="text-xs text-slate-500 pt-2">Confidence: {msg.structured.confidence}%</div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-sm">{msg.content}</p>
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <div>
              <p className="text-sm">Analyzing 835/837 data...</p>
              <p className="text-xs text-slate-500">Querying knowledge graph</p>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about payers, denials, forecasts..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <button 
            onClick={() => send()} 
            disabled={!input.trim() || loading}
            className="p-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-xl transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-500/30 bg-blue-500/10',
    slate: 'border-slate-600 bg-slate-800/50',
    amber: 'border-amber-500/30 bg-amber-500/10',
    emerald: 'border-emerald-500/30 bg-emerald-500/10',
  };
  const headerColors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    slate: 'bg-slate-700/50 text-slate-300',
    amber: 'bg-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
  };
  return (
    <div className={`rounded-xl border overflow-hidden ${colors[color]}`}>
      <div className={`px-3 py-2 ${headerColors[color]}`}>
        <span className="text-xs font-bold">{title}</span>
      </div>
      <div className="px-3 py-3">{children}</div>
    </div>
  );
}

function ChatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; border: string; text: string; label: string }> = {
    critical: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', label: 'CRITICAL' },
    elevated: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', label: 'ELEVATED' },
    stable: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', label: 'STABLE' },
  };
  const c = config[status] || config.stable;
  return <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${c.bg} ${c.border} ${c.text}`}>{c.label}</span>;
}
