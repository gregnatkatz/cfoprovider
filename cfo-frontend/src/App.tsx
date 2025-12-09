import { useState } from 'react';
import { 
  Activity, AlertTriangle, FileText, Sparkles, TrendingUp, Send, X, Loader2,
  ChevronRight, Download, Play, RefreshCw, Building2, Zap, Target, Shield,
  Brain, Bot, Radar, Scale, CheckCircle, Eye,
  Users, BadgeCheck
} from 'lucide-react';
import { 
  XAxis, YAxis, ResponsiveContainer, AreaChart, Area, CartesianGrid, 
  Tooltip, ComposedChart, Bar, PieChart, Pie, Cell, ReferenceLine, Line
} from 'recharts';

// =============================================================================
// DATA
// =============================================================================

const PAYERS = [
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

const WARFARE_ACTIONS = [
  { id: 'ACT-001', priority: 1, title: 'Send UHC Interest Demand Letter', description: 'Demand $1.24M interest owed for late payments', payer: 'UHC', expected_recovery: 1240000, probability: 0.85, expected_value: 1054000, agents: ['ContractAgent', 'ValidationAgent'], one_click: true },
  { id: 'ACT-002', priority: 2, title: 'Send UHC Contract Violation Notice', description: 'Section 7.1 violation - InterQual criteria change', payer: 'UHC', expected_recovery: 2100000, probability: 0.72, expected_value: 1512000, agents: ['ContractAgent', 'RegulatoryAgent', 'ValidationAgent'], one_click: true },
  { id: 'ACT-003', priority: 3, title: 'Process High-Value Appeals', description: 'Top 50 claims ranked by expected value', payer: 'Multiple', expected_recovery: 425000, probability: 0.72, expected_value: 306000, agents: ['ClaimsAgent', 'AppealAgent', 'RLOptimizer'], one_click: false }
];

const AGENTS = [
  { id: 'orchestrator', name: 'Orchestrator', status: 'active', tasks: 12 },
  { id: 'contract', name: 'Contract Agent', status: 'active', tasks: 4 },
  { id: 'claims', name: 'Claims Agent', status: 'active', tasks: 8 },
  { id: 'policy', name: 'Policy Agent', status: 'monitoring', tasks: 2 },
  { id: 'appeal', name: 'Appeal Agent', status: 'active', tasks: 5 },
  { id: 'negotiation', name: 'Negotiation Agent', status: 'idle', tasks: 0 },
  { id: 'regulatory', name: 'Regulatory Agent', status: 'active', tasks: 3 },
  { id: 'validation', name: 'Validation Agent', status: 'active', tasks: 15 },
  { id: 'reasoning', name: 'Reasoning Agent', status: 'active', tasks: 12 },
];

const KNOWLEDGE_SYSTEMS = [
  { id: 'graphrag', name: 'GraphRAG', status: 'online', queries: 847, desc: 'Relationship traversal' },
  { id: 'vectorrag', name: 'Vector RAG', status: 'online', queries: 1243, desc: 'Semantic search' },
  { id: 'kg', name: 'Knowledge Graph', status: 'online', entities: 15420, desc: 'Structured queries' },
  { id: 'rl', name: 'RL Optimizer', status: 'training', episodes: 5420, desc: 'Appeal optimization' },
];

const POLICY_ALERTS = [
  { id: 'ALERT-001', severity: 'critical', payer: 'Humana', title: 'Prior Auth Expansion for Imaging', predicted_days: 30, confidence: 0.82, impact: 1500000, signals: ['Q3 Earnings Call', 'Competitor Action'], detecting_agents: ['PolicyAgent', 'ReasoningAgent'] }
];

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { critical: 'bg-red-500/20 text-red-400 border-red-500/30', elevated: 'bg-amber-500/20 text-amber-400 border-amber-500/30', stable: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[status]}`}>{status}</span>;
}

function AgentBadge({ agent }: { agent: string }) {
  const colors: Record<string, string> = { ContractAgent: 'bg-blue-500/20 text-blue-400', ClaimsAgent: 'bg-purple-500/20 text-purple-400', PolicyAgent: 'bg-amber-500/20 text-amber-400', AppealAgent: 'bg-green-500/20 text-green-400', RegulatoryAgent: 'bg-red-500/20 text-red-400', ValidationAgent: 'bg-emerald-500/20 text-emerald-400', ReasoningAgent: 'bg-violet-500/20 text-violet-400', RLOptimizer: 'bg-cyan-500/20 text-cyan-400' };
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[agent] || 'bg-slate-500/20 text-slate-400'}`}>{agent.replace('Agent', '')}</span>;
}

const formatCurrency = (v: number) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`;

// =============================================================================
// MAIN APP
// =============================================================================

export default function App() {
  const [tab, setTab] = useState('summary');
  const [chatOpen, setChatOpen] = useState(true);
  const [selectedPayer, setSelectedPayer] = useState('uhc');
  const [showAgentPanel, setShowAgentPanel] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className={chatOpen ? 'mr-[420px]' : ''}>
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Payer Warfare Platform</h1>
                  <p className="text-xs text-slate-500">Multi-Agent AI • GraphRAG • RL</p>
                </div>
              </div>
              <nav className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                {[
                  { id: 'summary', label: 'CFO Summary', icon: FileText },
                  { id: 'actions', label: 'Action Center', icon: Zap, badge: WARFARE_ACTIONS.length },
                  { id: 'radar', label: 'Policy Radar', icon: Radar, badge: POLICY_ALERTS.length },
                  { id: 'analysis', label: 'Deep Analysis', icon: Activity },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${tab === t.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <t.icon className="w-4 h-4" />
                    {t.label}
                    {t.badge && <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{t.badge}</span>}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAgentPanel(!showAgentPanel)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50">
                <div className="flex -space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">9 Agents</span>
              </button>
              <button onClick={() => setChatOpen(!chatOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${chatOpen ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                <Bot className="w-4 h-4" />
                {chatOpen ? 'AI Assistant' : 'Open AI Chat'}
              </button>
            </div>
          </div>
        </header>

        {showAgentPanel && <AgentStatusPanel onClose={() => setShowAgentPanel(false)} />}

        <main className="p-6">
          {tab === 'summary' && <SummaryTab onPayerSelect={(id) => { setSelectedPayer(id); setTab('analysis'); }} />}
          {tab === 'actions' && <ActionCenterTab />}
          {tab === 'radar' && <PolicyRadarTab />}
          {tab === 'analysis' && <AnalysisTab selectedPayer={selectedPayer} onPayerChange={setSelectedPayer} />}
        </main>
      </div>
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}

// =============================================================================
// AGENT STATUS PANEL
// =============================================================================

function AgentStatusPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">Multi-Agent System</h3>
          <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">All Online</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">Specialized Agents</h4>
          <div className="grid grid-cols-3 gap-2">
            {AGENTS.map(a => (
              <div key={a.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <span className="text-sm font-medium">{a.name}</span>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${a.status === 'active' ? 'text-emerald-400' : a.status === 'monitoring' ? 'text-amber-400' : 'text-slate-500'}`}>{a.status}</span>
                  <span className="text-xs text-slate-500">{a.tasks} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">Knowledge Systems</h4>
          <div className="grid grid-cols-2 gap-2">
            {KNOWLEDGE_SYSTEMS.map(s => (
              <div key={s.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <span className="text-sm font-medium">{s.name}</span>
                <p className="text-xs text-slate-500">{s.desc}</p>
                <span className={`text-xs ${s.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUMMARY TAB
// =============================================================================

function SummaryTab({ onPayerSelect }: { onPayerSelect: (id: string) => void }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl"><Sparkles className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-emerald-400">$6.1M Recoverable</span>
                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1"><Brain className="w-3 h-3" /> AI Identified</span>
              </div>
              <p className="text-slate-300">Multi-agent analysis found 5 high-value actions ready for execution</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" /> 4 violations</span>
                <span className="flex items-center gap-1"><Target className="w-4 h-4 text-cyan-400" /> 500 appeals</span>
                <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-amber-400" /> 2 alerts</span>
              </div>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2"><Zap className="w-4 h-4" />View Actions</button>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded-full">CRITICAL</span>
              <span className="text-sm font-semibold text-red-400">UHC MA</span>
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1"><Brain className="w-3 h-3" /> ContractAgent + PolicyAgent</span>
            </div>
            <p className="text-white">InterQual criteria change detected. Contract violation (Section 7.1).</p>
            <p className="text-red-300/80 text-sm mt-1">Impact: $2.1M improper denials</p>
          </div>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium">Execute Response</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-lg font-semibold mb-4">Payer Portfolio</h3>
          <div className="space-y-2">
            {PAYERS.map(p => (
              <button key={p.id} onClick={() => onPayerSelect(p.id)} className={`w-full text-left p-3 rounded-lg border hover:border-cyan-500/50 ${p.risk === 'critical' ? 'border-red-500/50 bg-red-500/5' : p.risk === 'elevated' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-600 bg-slate-700/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {p.alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      <span className="font-semibold">{p.short}</span>
                      <StatusBadge status={p.risk} />
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-slate-400">${p.revenue}M</span>
                      <span className={p.yieldGap < -10 ? 'text-red-400' : p.yieldGap < -5 ? 'text-amber-400' : 'text-emerald-400'}>{p.yieldGap > 0 ? '+' : ''}{p.yieldGap}%</span>
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
        <div className="col-span-7 space-y-6">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <div className="flex justify-between mb-4">
              <div><h3 className="text-lg font-semibold">12-Week Cash Forecast</h3><p className="text-xs text-slate-500">AI-powered • 80% confidence</p></div>
              <div className="text-right"><p className="text-3xl font-bold font-mono">$630M</p><div className="flex items-center justify-end gap-1 text-emerald-400"><TrendingUp className="w-4 h-4" /><span className="text-sm">+4.2%</span></div></div>
            </div>
            <div className="h-40">
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
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Priority Actions</h3>
              <span className="text-xs text-slate-500">AI-ranked by ROI</span>
            </div>
            <div className="space-y-2">
              {WARFARE_ACTIONS.slice(0, 2).map((action, i) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>{action.priority}</span>
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-emerald-400">{formatCurrency(action.expected_value)} expected</span>
                        {action.agents.slice(0, 2).map(a => <AgentBadge key={a} agent={a} />)}
                      </div>
                    </div>
                  </div>
                  <button className={`px-3 py-1.5 rounded text-sm font-medium ${action.one_click ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>{action.one_click ? 'Execute' : 'View'}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ACTION CENTER TAB
// =============================================================================

function ActionCenterTab() {
  const totalEV = WARFARE_ACTIONS.reduce((s, a) => s + a.expected_value, 0);
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2"><Sparkles className="w-6 h-6 text-emerald-400" /><span className="text-sm text-emerald-400 font-medium">AI-IDENTIFIED OPPORTUNITIES</span></div>
            <div className="flex items-baseline gap-2"><span className="text-4xl font-bold text-white">{formatCurrency(totalEV)}</span><span className="text-slate-400">expected value</span></div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center"><p className="text-2xl font-bold text-white">{WARFARE_ACTIONS.length}</p><p className="text-slate-500">Actions</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{WARFARE_ACTIONS.filter(a => a.one_click).length}</p><p className="text-slate-500">One-Click</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-purple-400">9</p><p className="text-slate-500">Agents</p></div>
          </div>
        </div>
      </div>
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center gap-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <p className="text-purple-300 text-sm"><strong>Multi-Agent Analysis:</strong> ContractAgent found violations → RegulatoryAgent matched regulations → ValidationAgent verified → ReasoningAgent explained</p>
      </div>
      <div className="space-y-4">
        {WARFARE_ACTIONS.map((action, i) => (
          <div key={action.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-cyan-500/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-cyan-500' : 'bg-slate-600'}`}>{action.priority}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    {action.one_click && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1"><Zap className="w-3 h-3" /> One-Click</span>}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{action.description}</p>
                  <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-purple-400 mb-2"><Brain className="w-4 h-4" />AGENTS INVOLVED</div>
                    <div className="flex items-center gap-2 flex-wrap">{action.agents.map(a => <AgentBadge key={a} agent={a} />)}</div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div><span className="text-slate-500">Recovery:</span><span className="ml-2 font-semibold text-white">{formatCurrency(action.expected_recovery)}</span></div>
                    <div><span className="text-slate-500">Success:</span><span className="ml-2 font-semibold text-white">{(action.probability * 100).toFixed(0)}%</span></div>
                    <div><span className="text-slate-500">Expected:</span><span className="ml-2 font-semibold text-emerald-400">{formatCurrency(action.expected_value)}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2"><Send className="w-4 h-4" />Execute</button>
                <button className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg flex items-center gap-2 text-sm"><Eye className="w-4 h-4" />Preview</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// POLICY RADAR TAB
// =============================================================================

function PolicyRadarTab() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2"><Radar className="w-6 h-6 text-amber-400" /><span className="text-sm text-amber-400 font-medium">AI-POWERED POLICY RADAR</span></div>
        <h2 className="text-2xl font-bold mb-2">Predict Payer Changes Before They Hit</h2>
        <p className="text-slate-400">PolicyAgent monitors earnings calls, bulletins, competitor actions to predict changes 30-45 days early.</p>
      </div>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-purple-400" /><h3 className="font-semibold">How AI Predicts Changes</h3></div>
        <div className="grid grid-cols-4 gap-4">
          {[{ icon: FileText, label: "Earnings Calls", agent: "PolicyAgent" }, { icon: Building2, label: "Bulletins", agent: "PolicyAgent" }, { icon: Users, label: "Competitors", agent: "ReasoningAgent" }, { icon: Scale, label: "Regulatory", agent: "RegulatoryAgent" }].map((item, i) => (
            <div key={i} className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <item.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="font-medium text-white">{item.label}</div>
              <AgentBadge agent={item.agent} />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" />Active Alerts ({POLICY_ALERTS.length})</h3>
        {POLICY_ALERTS.map(alert => (
          <div key={alert.id} className="bg-slate-800/50 rounded-xl border-2 border-red-500/50 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-500/20 text-red-400">{alert.severity}</span><span className="text-slate-400">{alert.payer}</span></div>
                <h4 className="text-lg font-semibold text-white">{alert.title}</h4>
              </div>
              <div className="text-right"><div className="text-2xl font-bold text-white">~{alert.predicted_days} days</div><div className="text-sm text-slate-500">{(alert.confidence * 100).toFixed(0)}% confidence</div></div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 mb-4"><div className="text-red-400 text-sm font-medium">Impact: {formatCurrency(alert.impact)} if not prepared</div></div>
            <div className="flex items-center gap-4 mb-4">
              <div><div className="text-xs font-medium text-slate-500 uppercase mb-2">Signals</div><div className="flex flex-wrap gap-2">{alert.signals.map((s, i) => <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{s}</span>)}</div></div>
              <div><div className="text-xs font-medium text-slate-500 uppercase mb-2">Agents</div><div className="flex gap-2">{alert.detecting_agents.map(a => <AgentBadge key={a} agent={a} />)}</div></div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg">Prepare Now</button>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg">View Signals</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ANALYSIS TAB
// =============================================================================

function AnalysisTab({ selectedPayer, onPayerChange }: { selectedPayer: string; onPayerChange: (id: string) => void }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const payer = PAYERS.find(p => p.id === selectedPayer) || PAYERS[0];

  const runAnalysis = () => {
    setRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => { if (prev >= 100) { clearInterval(interval); setRunning(false); return 100; } return prev + 5; });
    }, 150);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-400">Payer:</label>
          <select value={selectedPayer} onChange={(e) => onPayerChange(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500">
            {PAYERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg font-medium">
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}Run Multi-Agent Analysis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"><Download className="w-4 h-4" />Export</button>
        </div>
      </div>

      <div className={`rounded-xl p-5 border ${payer.risk === 'critical' ? 'bg-red-500/10 border-red-500/30' : payer.risk === 'elevated' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2"><h2 className="text-2xl font-bold">{payer.name}</h2><StatusBadge status={payer.risk} /></div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-400">Revenue: <span className="text-white font-semibold">${payer.revenue}M</span></span>
              <span className="text-slate-400">Yield Gap: <span className={payer.yieldGap < -10 ? 'text-red-400' : 'text-amber-400'}>{payer.yieldGap}%</span></span>
              <span className="text-slate-400">Velocity: <span className="text-white">{payer.velocity}d</span> vs <span className="text-slate-500">{payer.contract}d</span></span>
            </div>
          </div>
          <div className="text-right"><div className="text-xs text-slate-500 mb-1">AI Recommendation</div><div className="text-lg font-semibold text-cyan-400">{payer.rec}</div></div>
        </div>
      </div>

      {running && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3"><Brain className="w-5 h-5 text-purple-400 animate-pulse" /><span className="text-purple-400 font-medium">Multi-Agent Analysis...</span></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">ContractAgent: Scanning violations</span><span className="text-emerald-400">{progress > 20 ? '✓' : '...'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">ClaimsAgent: Analyzing denials</span><span className="text-emerald-400">{progress > 40 ? '✓' : '...'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">ValidationAgent: Cross-checking</span><span className="text-emerald-400">{progress > 60 ? '✓' : '...'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">ReasoningAgent: Generating insights</span><span className="text-emerald-400">{progress > 80 ? '✓' : '...'}</span></div>
          </div>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Yield Trend</h3><span className="text-xs text-purple-400 flex items-center gap-1"><Brain className="w-3 h-3" /> ClaimsAgent</span></div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={YIELD_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[70, 85]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="v" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Payment Velocity</h3><span className="text-xs text-purple-400 flex items-center gap-1"><Brain className="w-3 h-3" /> ContractAgent</span></div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={VELOCITY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[25, 45]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                <Bar dataKey="d" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Denial Categories</h3><span className="text-xs text-purple-400 flex items-center gap-1"><Brain className="w-3 h-3" /> ClaimsAgent</span></div>
          <div className="h-48 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart><Pie data={DENIALS} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>{DENIALS.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} /></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {DENIALS.map(d => (<div key={d.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-sm text-slate-300">{d.name}</span></div><span className="text-sm font-semibold">${d.value}M</span></div>))}
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-purple-400" /><h3 className="font-semibold">AI Insights</h3></div>
          <div className="space-y-3">
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30"><div className="flex items-center gap-2 text-xs text-purple-400 mb-1"><Brain className="w-3 h-3" /> ReasoningAgent</div><p className="text-sm text-slate-300">Payment velocity +6 days over 6 months. Interest liability: $2.1M by Q2.</p></div>
            <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30"><div className="flex items-center gap-2 text-xs text-amber-400 mb-1"><Brain className="w-3 h-3" /> PolicyAgent</div><p className="text-sm text-slate-300">InterQual 2024.2 detected Nov 1. Contract specifies 2023.1 (Section 7.1).</p></div>
            <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30"><div className="flex items-center gap-2 text-xs text-emerald-400 mb-1"><BadgeCheck className="w-3 h-3" /> ValidationAgent</div><p className="text-sm text-slate-300">All calculations verified. Confidence: 94%.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CHAT PANEL
// =============================================================================

interface ChatMessage {
  type: 'system' | 'user' | 'ai';
  content: string;
  agents?: string[];
  agent?: string;
  reasoning?: string;
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'system', content: 'Multi-Agent AI Active', agents: ['Orchestrator', 'ContractAgent', 'ValidationAgent'] },
    { type: 'ai', content: "Found $6.1M recoverable across 5 actions. Top: $1.24M interest demand for UHC.", agent: 'Orchestrator', reasoning: 'ContractAgent → ValidationAgent → ReasoningAgent' }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { type: 'user', content: input };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const resp: ChatMessage = { type: 'ai', content: '', agent: 'Orchestrator', reasoning: '' };
      if (input.toLowerCase().includes('uhc')) {
        resp.content = "UHC has 2 violations:\n1. Payment: 38d vs 30d → $1.24M interest\n2. Criteria: InterQual 2024.2 vs 2023.1 → $2.1M denials\n\nRecommend: Send interest demand first.";
        resp.agent = 'ContractAgent';
        resp.reasoning = 'GraphRAG traversed Contract→Violation. ValidationAgent confirmed.';
      } else if (input.toLowerCase().includes('appeal')) {
        resp.content = "500 appeals ranked by ROI. Top: CLM2024891 ($12.4K, 78% win). Bottom 127 should write off.";
        resp.agent = 'AppealAgent';
        resp.reasoning = 'RLOptimizer sequenced by expected value.';
      } else {
        resp.content = "I can help with: contract violations, appeals, policy predictions, negotiation. What area?";
      }
      setMessages(p => [...p, resp]);
      setThinking(false);
    }, 1200);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col z-50">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Brain className="w-5 h-5 text-purple-400" /></div>
            <div><h3 className="font-semibold text-white">AI Intelligence</h3><p className="text-xs text-slate-500">Multi-Agent System</p></div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i}>
            {m.type === 'system' ? (
              <div className="text-center"><span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-xs text-slate-400"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />{m.content}</span></div>
            ) : m.type === 'user' ? (
              <div className="flex justify-end"><div className="max-w-[85%] bg-cyan-500 text-white rounded-2xl rounded-br-sm px-4 py-3"><p className="text-sm">{m.content}</p></div></div>
            ) : (
              <div className="flex justify-start"><div className="max-w-[90%] bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-purple-400" /><span className="text-xs text-purple-400 font-medium">{m.agent}</span></div>
                <div className="text-sm text-slate-200 whitespace-pre-line">{m.content}</div>
                {m.reasoning && <div className="mt-3 pt-3 border-t border-slate-700"><div className="text-xs text-slate-500">Reasoning: {m.reasoning}</div></div>}
              </div></div>
            )}
          </div>
        ))}
        {thinking && <div className="flex items-center gap-3 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Agents processing...</span></div>}
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && send()} placeholder="Ask about violations, appeals..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
          <button onClick={send} className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-lg"><Send className="w-4 h-4 text-white" /></button>
        </div>
        <div className="flex gap-2 mt-2">{['UHC violations', 'Appeal queue', 'Policy alerts'].map(q => <button key={q} onClick={() => setInput(q)} className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full hover:bg-slate-700">{q}</button>)}</div>
      </div>
    </div>
  );
}
