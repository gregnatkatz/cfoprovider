import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, FileText, Sparkles, Send, X, Loader2, Download, Building2, Zap, Target, Brain, Bot, Radar, Scale, Gavel, CheckCircle, Eye, ArrowUpRight, ArrowDownRight, Users, Copy, BarChart3, Heart, DollarSign, Search, Database, ChevronDown, ChevronUp, TrendingUp, Upload, Activity, Layers } from 'lucide-react';

// TypeScript interfaces
interface Violation {
  id: string;
  payer: string;
  type: string;
  title: string;
  section: string;
  requirement: string;
  actual: string;
  gap: string;
  claims: number;
  principal: number;
  interest: number;
  confidence: number;
  agents: string[];
  contractText: string;
  penaltyText: string;
}

interface DemandLetter {
  to: string;
  subject: string;
  body: string;
  attachments: string[];
}

interface Appeal {
  rank: number;
  id: string;
  payer: string;
  dos: string;
  amount: number;
  carc: string;
  desc: string;
  prob: number;
  ev: number;
  days: number;
  reason: string;
}


interface ThinkingSection {
  question_analysis: string;
  relevant_data: string;
  agent_routing: string;
  reasoning_steps: string[];
}

interface ChatResponse {
  thinking?: ThinkingSection;
  financial_impact?: { revenue_at_risk: string; ytd_impact: string; trend_or_recovery: string };
  root_cause?: { primary_cause: string; contributing_factors: string[]; evidence: string };
  contract_implication?: { section_reference: string; violation_type: string; legal_standing: string } | null;
  recommended_actions?: { immediate: string; short_term: string; strategic: string };
  sources?: { data_sources: string[]; documents: string[]; knowledge_graph: string[] };
  confidence?: number;
  model?: string;
  agent_used?: string;
}

interface ChatMessage {
  t: 'user' | 'ai';
  m: string;
  a?: string;
  r?: string;
  data?: ChatResponse;
}

// API URL
const API_URL = 'https://app-gvmsuvtn.fly.dev';

// Payer data interfaces for dynamic charts
interface PayerData {
  id: string;
  name: string;
  shortName: string;
  type: string;
  annualRevenue: number;
  yieldGap: number;
  cashVelocity: number;
  contractedVelocity: number;
  riskTier: string;
  recommendation: string;
  hasAlert: boolean;
  contractExpiration: string;
}

interface DenialBreakdown {
  name: string;
  rate: number;
  amount: number;
  color: string;
}

interface YieldTrend {
  month: string;
  yield: number;
}

interface PayerAnalysis {
  payer: PayerData;
  yield_analysis: {
    current: number;
    contracted: number;
    gap: number;
    lost_revenue: number;
  };
  denial_breakdown: DenialBreakdown[];
  yield_trend: YieldTrend[];
  cash_forecast: { month: string; projected: number; actual: number }[];
}

// DATA
const VIOLATIONS = [
  { id: 'VIO-001', payer: 'UHC', type: 'payment_velocity', title: 'Payment Velocity Violation', section: 'Section 4.1-4.2', requirement: '30 days', actual: '38 days', gap: '8 days', claims: 4247, principal: 12400000, interest: 1240000, confidence: 0.94, agents: ['ContractAgent', 'ValidationAgent'], contractText: 'Payment within 30 calendar days of clean claim receipt.', penaltyText: 'Late payments accrue interest at 12% annually.' },
  { id: 'VIO-002', payer: 'UHC', type: 'criteria_change', title: 'Unauthorized Criteria Change', section: 'Section 7.1', requirement: 'InterQual 2023.1', actual: 'InterQual 2024.2', gap: 'Version mismatch', claims: 847, principal: 2100000, interest: 0, confidence: 0.89, agents: ['PolicyAgent', 'ContractAgent'], contractText: 'Medical necessity using InterQual 2023.1 as mutually agreed.', penaltyText: 'Unauthorized changes constitute material breach.' },
  { id: 'VIO-003', payer: 'Humana', type: 'payment_velocity', title: 'Payment Velocity Violation', section: 'Section 5.1-5.3', requirement: '30 days', actual: '42 days', gap: '12 days', claims: 2891, principal: 8900000, interest: 890000, confidence: 0.92, agents: ['ContractAgent', 'ClaimsAgent'], contractText: 'Payment due within 30 days of clean claim receipt.', penaltyText: 'Interest accrues at 10% annually on late payments.' }
];

const DEMAND_LETTERS: Record<string, DemandLetter> = {
  'VIO-001': { to: 'UnitedHealthcare Claims Department', subject: 'Demand for Payment - Interest Owed ($1,240,000)', body: `Dear Claims Administrator:\n\nPursuant to Section 4.2 of our Provider Agreement and Florida Statute 627.6131, we demand payment of accrued interest.\n\nVIOLATION SUMMARY:\n- Contract Requirement: 30 days\n- Actual Performance: 38 days\n- Affected Claims: 4,247\n- Principal Delayed: $12,400,000\n- Interest Rate: 12% annually\n- Interest Owed: $1,240,000\n\nWe demand payment within 30 days.\n\nSincerely,\nContosoHealth CFO`, attachments: ['Payment_Analysis.xlsx', 'Contract_Section_4.pdf', 'Interest_Calc.xlsx'] },
  'VIO-002': { to: 'UnitedHealthcare Medical Director', subject: 'Notice of Material Breach - Section 7.1', body: `Dear Medical Director:\n\nThis is formal notice of material breach.\n\nBREACH: Contract specifies InterQual 2023.1. You are applying 2024.2 without amendment.\n\nIMPACT: $2,100,000 in improper denials\n\nDEMAND: Revert to 2023.1, reprocess 847 claims, pay $2.1M within 30 days.\n\nSincerely,\nContosoHealth CFO`, attachments: ['Denial_Analysis.xlsx', 'Contract_Section_7.pdf'] },
  'VIO-003': { to: 'Humana Claims Department', subject: 'Demand for Payment - Interest Owed ($890,000)', body: `Dear Claims Administrator:\n\nPursuant to Section 5.3, we demand payment of accrued interest.\n\nVIOLATION: 30 days required, 42 days actual\nClaims: 2,891 | Principal: $8.9M | Interest: $890,000\n\nPayment demanded within 30 days.\n\nSincerely,\nContosoHealth CFO`, attachments: ['Payment_Analysis.xlsx', 'Contract.pdf'] }
};

const APPEALS = [
  { rank: 1, id: 'CLM2024-88721', payer: 'UHC', dos: '2024-10-15', amount: 12400, carc: 'CO-16', desc: 'Missing info', prob: 0.87, ev: 9221, days: 45, reason: 'Identical to 14 won claims. Missing auth in EMR.' },
  { rank: 2, id: 'CLM2024-87445', payer: 'Humana', dos: '2024-10-22', amount: 9800, carc: 'CO-197', desc: 'Prior auth', prob: 0.82, ev: 6748, days: 38, reason: 'Auth on file - payer system error.' },
  { rank: 3, id: 'CLM2024-89772', payer: 'BCBS', dos: '2024-09-28', amount: 8200, carc: 'OA-23', desc: 'Med necessity', prob: 0.72, ev: 5018, days: 52, reason: 'Documentation supports. InterQual met.' },
  { rank: 4, id: 'CLM2024-86556', payer: 'Medicare', dos: '2024-11-01', amount: 7500, carc: 'CO-197', desc: 'Prior auth', prob: 0.68, ev: 3850, days: 29, reason: 'Retro auth approved.' },
  { rank: 5, id: 'CLM2024-90889', payer: 'Aetna', dos: '2024-10-08', amount: 6800, carc: 'CO-16', desc: 'Missing info', prob: 0.65, ev: 3270, days: 41, reason: 'Records attached to original.' },
  { rank: 6, id: 'CLM2024-91234', payer: 'BCBS', dos: '2024-10-12', amount: 6200, carc: 'CO-97', desc: 'Bundling', prob: 0.62, ev: 2844, days: 35, reason: 'Unbundling justified per CCI edits.' },
  { rank: 7, id: 'CLM2024-92567', payer: 'Cigna', dos: '2024-10-05', amount: 5800, carc: 'CO-16', desc: 'Missing info', prob: 0.58, ev: 2494, days: 48, reason: 'Medical records submitted with claim.' },
  { rank: 8, id: 'CLM2024-93890', payer: 'Medicare', dos: '2024-09-22', amount: 5400, carc: 'OA-23', desc: 'Med necessity', prob: 0.55, ev: 2170, days: 55, reason: 'LCD criteria met per documentation.' },
  { rank: 9, id: 'CLM2024-94123', payer: 'UHC', dos: '2024-10-18', amount: 4900, carc: 'CO-197', desc: 'Prior auth', prob: 0.52, ev: 1798, days: 32, reason: 'Emergency exception applies.' },
  { rank: 10, id: 'CLM2024-95456', payer: 'Humana', dos: '2024-09-30', amount: 4500, carc: 'CO-97', desc: 'Bundling', prob: 0.48, ev: 1460, days: 44, reason: 'Modifier 59 appropriate per guidelines.' },
  { rank: 498, id: 'CLM2024-71112', payer: 'Cigna', dos: '2024-08-20', amount: 450, carc: 'PR-1', desc: 'Patient resp', prob: 0.12, ev: -96, days: 15, reason: 'Patient deductible. Write off.' },
  { rank: 499, id: 'CLM2024-70098', payer: 'Aetna', dos: '2024-08-25', amount: 380, carc: 'CO-4', desc: 'Not covered', prob: 0.08, ev: -119, days: 8, reason: 'Excluded service.' },
  { rank: 500, id: 'CLM2024-69034', payer: 'Medicare', dos: '2024-08-30', amount: 290, carc: 'PR-1', desc: 'Patient resp', prob: 0.05, ev: -138, days: 12, reason: 'Copay. Not appealable.' }
];

// Win rates with confidence intervals based on industry benchmarks (HFMA, AHA, KFF 2022-2024)
const WIN_RATES = [
  { carc: 'CO-16', desc: 'Missing info', rate: 0.78, margin: 0.06, vol: 1247, color: '#22c55e', benchmark: { industry: 0.75, topQuartile: 0.85 } },
  { carc: 'CO-197', desc: 'Prior auth', rate: 0.68, margin: 0.07, vol: 892, color: '#84cc16', benchmark: { industry: 0.65, topQuartile: 0.75 } },
  { carc: 'OA-23', desc: 'Med necessity', rate: 0.52, margin: 0.08, vol: 634, color: '#eab308', benchmark: { industry: 0.45, topQuartile: 0.55 } },
  { carc: 'CO-97', desc: 'Bundling', rate: 0.45, margin: 0.09, vol: 423, color: '#f97316', benchmark: { industry: 0.40, topQuartile: 0.50 } },
  { carc: 'CO-4', desc: 'Not covered', rate: 0.22, margin: 0.05, vol: 567, color: '#ef4444', benchmark: { industry: 0.15, topQuartile: 0.25 } },
  { carc: 'PR-1', desc: 'Patient resp', rate: 0.08, margin: 0.03, vol: 1124, color: '#dc2626', benchmark: { industry: 0.05, topQuartile: 0.10 } }
];

// Payer-specific win rate multipliers (UHC harder, BCBS easier)
// Payer win multipliers - used in AI reasoning display
const _PAYER_WIN_MULTIPLIERS: Record<string, number> = {
  'UHC': 0.85,      // 15% harder to win appeals
  'Humana': 0.95,   // 5% harder
  'BCBS': 1.05,     // 5% easier
  'Medicare': 1.10, // 10% easier (regulatory backing)
  'Aetna': 0.90,    // 10% harder
  'Cigna': 0.92     // 8% harder
};
void _PAYER_WIN_MULTIPLIERS; // Suppress unused warning - data shown in AI reasoning

// Payer scorecards (A-F grades) - used in payer analysis
const _PAYER_SCORECARDS: Record<string, { grade: string; paymentVelocity: string; denialRate: string; appealResponse: string }> = {
  'UHC': { grade: 'C', paymentVelocity: 'D', denialRate: 'D', appealResponse: 'C' },
  'Humana': { grade: 'B', paymentVelocity: 'C', denialRate: 'B', appealResponse: 'B' },
  'BCBS': { grade: 'B+', paymentVelocity: 'B', denialRate: 'B', appealResponse: 'A' },
  'Medicare': { grade: 'A', paymentVelocity: 'A', denialRate: 'A', appealResponse: 'B' },
  'Aetna': { grade: 'C+', paymentVelocity: 'C', denialRate: 'C', appealResponse: 'C' },
  'Cigna': { grade: 'B-', paymentVelocity: 'B', denialRate: 'C', appealResponse: 'B' }
};
void _PAYER_SCORECARDS; // Suppress unused warning - data shown in payer analysis

const ALERTS = [
  { id: 1, payer: 'Humana', title: 'Prior Auth Expansion - Imaging', days: 30, conf: 0.82, impact: 1500000, severity: 'critical', signals: [{ src: 'Q3 Earnings', txt: '"enhanced prior auth for imaging"' }, { src: 'Competitor', txt: 'Aetna made change 45 days ago' }], actions: ['Update radiology templates', 'Train schedulers', 'Prepare appeal templates'] },
  { id: 2, payer: 'FL Blue', title: 'IRF Criteria Tightening', days: 45, conf: 0.58, impact: 800000, severity: 'warning', signals: [{ src: 'Industry', txt: 'Multiple payers tightening rehab' }], actions: ['Review IRF documentation', 'Benchmark FIM scores'] }
];

const NEGO = {
  payer: 'UHC', expires: '2025-06-30', daysLeft: 203, leverage: 78, opportunity: 8200000,
  yourLeverage: [{ f: 'Active Violations', v: '$3.34M', s: 'strong' }, { f: 'Market Position', v: '#2 Orlando', s: 'strong' }, { f: 'Volume', v: '12,400/yr', s: 'strong' }],
  theirLeverage: [{ f: 'Revenue %', v: '23% MA', s: 'moderate' }, { f: 'Market Share', v: '34%', s: 'moderate' }],
  rates: [{ svc: 'Cardiac DRG', yours: 42000, market: 51000, gap: -0.18 }, { svc: 'Joint Replace', yours: 35000, market: 44000, gap: -0.20 }, { svc: 'Observation', yours: 1800, market: 2100, gap: -0.14 }, { svc: 'ED Level 5', yours: 680, market: 780, gap: -0.13 }],
  strategy: { open: 0.15, target: 0.12, walk: 0.08, batna: 'Terminate, redirect to Humana MA' },
  points: ['Two documented violations ($3.34M)', 'Payment velocity 8 days over', 'Rates 14-20% below market', '#2 provider - network disruption risk']
};

const REGS = [
  { id: 1, vio: 'VIO-002', code: '42 CFR 422.504(a)', title: 'MA Contract Requirements', agency: 'CMS', prob: 0.73, penalty: '$100K/violation' },
  { id: 2, vio: 'VIO-001', code: 'FL Statute 627.6131', title: 'Prompt Payment', agency: 'Florida OIR', prob: 0.81, penalty: 'Interest + $10K/day' }
];

// API Base URL
const API_BASE = 'https://app-gvmsuvtn.fly.dev';

const AGENTS = [
  { name: 'Orchestrator', status: 'active', tasks: 12 }, { name: 'Contract', status: 'active', tasks: 4 },
  { name: 'Claims', status: 'active', tasks: 8 }, { name: 'Policy', status: 'monitoring', tasks: 2 },
  { name: 'Appeal', status: 'active', tasks: 5 }, { name: 'Negotiation', status: 'idle', tasks: 0 },
  { name: 'Regulatory', status: 'active', tasks: 3 }, { name: 'Validation', status: 'active', tasks: 15 },
  { name: 'Reasoning', status: 'active', tasks: 12 }
];

const SYSTEMS = [
  { name: 'GraphRAG', status: 'online', metric: '847 queries' },
  { name: 'Vector RAG', status: 'online', metric: '1,243 queries' },
  { name: 'Knowledge Graph', status: 'online', metric: '15,420 entities' },
  { name: 'RL Optimizer', status: 'training', metric: '5,420 episodes' }
];

// HELPERS
const fmt = (v: number): string => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`;
const pct = (v: number): string => `${(v*100).toFixed(0)}%`;

const Badge = ({ type, children }: { type: string; children: React.ReactNode }) => {
  const c: Record<string, string> = { critical: 'bg-red-500/20 text-red-400', elevated: 'bg-amber-500/20 text-amber-400', warning: 'bg-amber-500/20 text-amber-400', stable: 'bg-emerald-500/20 text-emerald-400', strong: 'bg-emerald-500/20 text-emerald-400', moderate: 'bg-amber-500/20 text-amber-400' };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c[type] || 'bg-slate-500/20 text-slate-400'}`}>{children}</span>;
};

const AgentBadge = ({ name }: { name: string }) => {
  const c: Record<string, string> = { Contract: 'text-blue-400', Claims: 'text-purple-400', Policy: 'text-amber-400', Appeal: 'text-green-400', Regulatory: 'text-red-400', Validation: 'text-emerald-400', Reasoning: 'text-violet-400', RL: 'text-cyan-400' };
  return <span className={`text-xs px-2 py-0.5 rounded bg-slate-700 ${c[name] || 'text-slate-400'}`}>{name}</span>;
};

const Confidence = ({ v }: { v: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${v >= 0.8 ? 'bg-emerald-500' : v >= 0.6 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${v*100}%` }} />
    </div>
    <span className="text-xs text-slate-400">{pct(v)}</span>
  </div>
);

// MAIN APP
export default function App() {
  const [tab, setTab] = useState('summary');
  const [chat, setChat] = useState(true);
  const [agents, setAgents] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Violation | Appeal | null>(null);

  const open = (type: string, data: Violation | Appeal) => { setModal(type); setModalData(data); };
  const close = () => { setModal(null); setModalData(null); };
  const totalRecoverable = VIOLATIONS.reduce((s, v) => s + v.principal + v.interest, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className={chat ? 'mr-[400px]' : ''}>
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
                  <Heart className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">ContosoHealth</h1>
                  <p className="text-xs text-slate-500">Healing Through Compassion</p>
                </div>
              </div>
              <nav className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                {[
                                    { id: 'summary', label: 'Summary', icon: FileText },
                                    { id: 'executive', label: 'Executive', icon: Layers },
                                    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
                                    { id: 'agents', label: 'Agents', icon: Brain },
                                    { id: 'violations', label: 'Violations', icon: AlertTriangle, badge: VIOLATIONS.length },
                                    { id: 'appeals', label: 'Appeals', icon: Target, badge: '500' },
                                    { id: 'radar', label: 'Radar', icon: Radar, badge: ALERTS.length },
                                    { id: 'negotiate', label: 'Negotiate', icon: Scale },
                                    { id: 'performance', label: 'Performance', icon: Activity },
                                    { id: 'simulate', label: 'Simulate', icon: Upload }
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${tab === t.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <t.icon className="w-4 h-4" />{t.label}
                    {t.badge && <span className="px-1.5 py-0.5 text-xs bg-red-500 rounded-full">{t.badge}</span>}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAgents(!agents)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50">
                <Brain className="w-4 h-4 text-purple-400" /><span className="text-sm">9 Agents</span><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              <button onClick={() => setChat(!chat)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${chat ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'}`}>
                <Bot className="w-4 h-4" />AI Chat
              </button>
            </div>
          </div>
        </header>

        {/* AGENT PANEL */}
        {agents && (
          <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />Multi-Agent System<Badge type="stable">Online</Badge></h3>
              <button onClick={() => setAgents(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                {AGENTS.map(a => (
                  <div key={a.name} className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="flex justify-between text-xs"><span className={a.status === 'active' ? 'text-emerald-400' : a.status === 'monitoring' ? 'text-amber-400' : 'text-slate-500'}>{a.status}</span><span className="text-slate-500">{a.tasks}</span></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SYSTEMS.map(s => (
                  <div key={s.name} className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="flex justify-between text-xs"><span className={s.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}>{s.status}</span><span className="text-slate-400">{s.metric}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MAIN */}
        <main className="p-6">
                    {tab === 'summary' && <SummaryTab total={totalRecoverable} onNav={setTab} open={open} />}
                    {tab === 'executive' && <ExecutiveDashboard />}
                    {tab === 'forecast' && <ForecastTab />}
                    {tab === 'agents' && <AgentsTab />}
                    {tab === 'violations' && <ViolationsTab open={open} />}
                    {tab === 'appeals' && <AppealsTab open={open} />}
                    {tab === 'radar' && <RadarTab />}
                    {tab === 'negotiate' && <NegotiateTab />}
                    {tab === 'performance' && <ModelPerformanceTab />}
                    {tab === 'simulate' && <SimulationModeTab />}
        </main>
      </div>

      {chat && <ChatPanel close={() => setChat(false)} />}
      {modal === 'letter' && modalData && <LetterModal data={modalData as Violation} close={close} />}
      {modal === 'violation' && modalData && <ViolationModal data={modalData as Violation} close={close} open={open} />}
      {modal === 'appeal' && modalData && <AppealModal data={modalData as Appeal} close={close} />}
    </div>
  );
}

// SUMMARY TAB
// Dynamic Payer Charts Component
function PayerCharts() {
  const [payers, setPayers] = useState<PayerData[]>([]);
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [analysis, setAnalysis] = useState<PayerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [denialBreakdown, setDenialBreakdown] = useState<DenialBreakdown[]>([]);
  const [yieldTrend, setYieldTrend] = useState<YieldTrend[]>([]);

  // Fetch payers list on mount
  useEffect(() => {
    fetch(`${API_URL}/api/payers`)
      .then(res => res.json())
      .then(data => {
        setPayers(data);
        // Fetch overall denial breakdown
        fetch(`${API_URL}/api/analysis/denial-breakdown`)
          .then(res => res.json())
          .then(setDenialBreakdown);
        fetch(`${API_URL}/api/analysis/yield-trend`)
          .then(res => res.json())
          .then(setYieldTrend);
      })
      .catch(console.error);
  }, []);

  // Fetch payer-specific data when selection changes
  useEffect(() => {
    if (selectedPayer === 'all') {
      setAnalysis(null);
      fetch(`${API_URL}/api/analysis/denial-breakdown`)
        .then(res => res.json())
        .then(setDenialBreakdown);
      fetch(`${API_URL}/api/analysis/yield-trend`)
        .then(res => res.json())
        .then(setYieldTrend);
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/api/analysis/payer/${selectedPayer}`)
      .then(res => res.json())
      .then(data => {
        setAnalysis(data);
        setDenialBreakdown(data.denial_breakdown || []);
        setYieldTrend(data.yield_trend || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPayer]);

  const maxDenialRate = Math.max(...denialBreakdown.map(d => d.rate), 1);
  const maxYield = Math.max(...yieldTrend.map(y => y.yield), 100);
  const minYield = Math.min(...yieldTrend.map(y => y.yield), 0);

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Payer Analytics
          <span className="text-xs text-slate-500">(SQLite)</span>
        </h2>
        <select
          value={selectedPayer}
          onChange={(e) => setSelectedPayer(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs focus:border-cyan-500 outline-none"
        >
          <option value="all">All Payers</option>
          {payers.map(p => (
            <option key={p.id} value={p.id}>{p.shortName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="ml-2 text-slate-400 text-sm">Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {/* Yield Trend Chart */}
          <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Yield Trend
              {analysis && <span className="text-xs text-slate-500 ml-1">• {analysis.payer.shortName}</span>}
            </h3>
            <div className="h-20 flex items-end gap-1">
              {yieldTrend.map((point, i) => {
                const height = ((point.yield - minYield + 10) / (maxYield - minYield + 20)) * 100;
                const isLow = point.yield < 70;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all ${isLow ? 'bg-red-500' : 'bg-cyan-500'}`}
                      style={{ height: `${height}%` }}
                      title={`${point.month}: ${point.yield.toFixed(1)}%`}
                    />
                    <span className="text-[9px] text-slate-500 mt-1">{point.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{minYield.toFixed(0)}%</span>
              <span>{maxYield.toFixed(0)}%</span>
            </div>
          </div>

          {/* Denial Breakdown Chart */}
          <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Denials
              {analysis && <span className="text-xs text-slate-500 ml-1">• {analysis.payer.shortName}</span>}
            </h3>
            <div className="space-y-1.5">
              {denialBreakdown.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-20 truncate">{d.name}</span>
                  <div className="flex-1 h-3 bg-slate-800 rounded overflow-hidden">
                    <div 
                      className="h-full rounded transition-all"
                      style={{ width: `${(d.rate / maxDenialRate) * 100}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right">{d.rate.toFixed(0)}%</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-2">{fmt(denialBreakdown.reduce((s, d) => s + d.amount, 0))} total</div>
          </div>

          {/* Payer Summary + Cash Forecast Stacked */}
          <div className="flex flex-col gap-2">
            {/* Payer Summary Card */}
            {analysis ? (
              <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50 flex-1">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  {analysis.payer.shortName}
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-semibold ${
                    analysis.payer.riskTier === 'critical' ? 'bg-red-500/20 text-red-400' :
                    analysis.payer.riskTier === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {analysis.payer.riskTier.toUpperCase()}
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/50 rounded p-1.5">
                    <div className="text-base font-bold text-emerald-400">{fmt(analysis.payer.annualRevenue)}</div>
                    <div className="text-xs text-slate-500">Revenue</div>
                  </div>
                  <div className="bg-slate-800/50 rounded p-1.5">
                    <div className={`text-base font-bold ${analysis.payer.yieldGap < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {analysis.payer.yieldGap.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">Yield Gap</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50 flex-1 flex items-center justify-center text-sm text-slate-500">
                Select payer for details
              </div>
            )}

            {/* Cash Forecast Chart */}
            {analysis && analysis.cash_forecast ? (
              <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50 flex-1">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Cash Forecast
                </h3>
                <div className="h-12 flex items-end gap-1">
                  {analysis.cash_forecast.slice(0, 6).map((point, i) => {
                    const maxVal = Math.max(...analysis.cash_forecast.map(p => Math.max(p.projected, p.actual)));
                    const projHeight = (point.projected / maxVal) * 100;
                    const actHeight = (point.actual / maxVal) * 100;
                    return (
                      <div key={i} className="flex-1 flex gap-0.5 items-end h-10">
                        <div className="flex-1 bg-cyan-500/50 rounded-t" style={{ height: `${projHeight}%` }} />
                        <div className="flex-1 bg-emerald-500 rounded-t" style={{ height: `${actHeight}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-cyan-500/50 rounded" />Proj</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded" />Actual</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded p-3 border border-slate-700/50 flex-1 flex items-center justify-center text-sm text-slate-500">
                Select payer for forecast
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTab({ total, onNav, open }: { total: number; onNav: (tab: string) => void; open: (type: string, data: Violation) => void }) {
  const [showMethodology, setShowMethodology] = useState(false);
  
  // Confidence breakdown
  const highConfidence = total * 0.71;  // $18.2M
  const mediumConfidence = total * 0.20; // $5.1M
  const needsReview = total * 0.09;      // $2.2M
  
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Hero Section with Confidence Breakdown */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-5xl font-bold">{fmt(total)}</span>
              <span className="text-slate-400 text-lg">recoverable</span>
            </div>
            {/* Confidence Breakdown */}
            <div className="flex gap-6 mb-3 ml-9">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {fmt(highConfidence)} high confidence
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {fmt(mediumConfidence)} medium
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                {fmt(needsReview)} needs review
              </span>
            </div>
            <div className="flex gap-6 ml-9 text-sm text-slate-400">
              <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-red-400" />{VIOLATIONS.length} violations</span>
              <span className="flex items-center gap-1"><Target className="w-4 h-4 text-cyan-400" />500 appeals</span>
              <span className="flex items-center gap-1"><Radar className="w-4 h-4 text-purple-400" />{ALERTS.length} alerts</span>
              <span className="text-xs text-slate-500 ml-4">Data as of: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <button onClick={() => open('letter', VIOLATIONS[0])} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />Execute
          </button>
        </div>
      </div>

      {/* AI Discovery Summary - NEW */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="font-semibold">AI Discovery Summary</span>
          </div>
          <button 
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            <Database className="w-3 h-3" />
            {showMethodology ? 'Hide' : 'How we calculated this'}
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs text-slate-500 mb-1">Manual Audit (Q3)</div>
              <div className="text-lg text-slate-400">4 violations • $1.2M</div>
            </div>
            <div className="text-2xl text-slate-600">→</div>
            <div>
              <div className="text-xs text-purple-400 mb-1">AI Analysis</div>
              <div className="text-lg">23 violations • <span className="text-emerald-400">$6.0M</span></div>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 475% more found
            </span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Zap className="w-4 h-4" /> 12 days → 47 min
            </span>
          </div>
        </div>
        
        {showMethodology && (
          <div className="mt-4 pt-4 border-t border-purple-500/20 text-xs text-slate-400">
            <div className="grid grid-cols-3 gap-4">
              <div><span className="text-purple-400">Data Sources:</span> 835 remittance files, contract database, historical appeals</div>
              <div><span className="text-purple-400">Analysis:</span> Pattern matching on 72,000 claims, contract term extraction</div>
              <div><span className="text-purple-400">Validation:</span> Cross-referenced with HFMA benchmarks (2022-2024)</div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Payer Charts */}
      <PayerCharts />

      <div className="grid grid-cols-2 gap-4">
        {/* Priority Actions */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><Zap className="w-5 h-5 text-amber-400" />Priority Actions</h2>
          <div className="space-y-2">
            {VIOLATIONS.map((v, i) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-cyan-500' : 'bg-slate-600'}`}>{i + 1}</div>
                  <div>
                    <div className="font-medium">{v.title} <span className="text-slate-500 text-sm">• {v.payer}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-semibold">{fmt(v.principal + v.interest)}</span>
                      <span className="text-xs text-slate-500">{(v.confidence * 100).toFixed(0)}% conf (n={v.claims})</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => open('violation', v)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => open('letter', v)} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center gap-1 text-sm font-medium"><Send className="w-4 h-4" />Send</button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export to Excel
          </button>
        </div>

        {/* Quick Cards */}
        <div className="grid grid-rows-3 gap-3">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 flex items-center justify-between hover:border-cyan-500/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-semibold">Appeal Queue</div>
                <div className="text-sm text-slate-400">500 total • <span className="text-emerald-400">$425K</span> expected</div>
              </div>
            </div>
            <button onClick={() => onNav('appeals')} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">View →</button>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-amber-500/30 p-3 flex items-center justify-between hover:border-amber-500/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Radar className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-semibold">{ALERTS[0].title}</div>
                <div className="text-sm text-slate-400">{ALERTS[0].payer} • <span className="text-amber-400">{fmt(ALERTS[0].impact)}</span> at risk</div>
              </div>
            </div>
            <button onClick={() => onNav('radar')} className="px-4 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-sm">Prepare →</button>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 flex items-center justify-between hover:border-purple-500/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold">{NEGO.payer} Negotiation</div>
                <div className="text-sm text-slate-400">Leverage: <span className="text-emerald-400">{NEGO.leverage}/100</span> • <span className="text-cyan-400">{fmt(NEGO.opportunity)}</span></div>
              </div>
            </div>
            <button onClick={() => onNav('negotiate')} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Playbook →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// VIOLATIONS TAB
function ViolationsTab({ open }: { open: (type: string, data: Violation) => void }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">Contract Violations</h2>
      {VIOLATIONS.map(v => (
        <div key={v.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className={`p-5 ${v.type === 'payment_velocity' ? 'bg-amber-500/5' : 'bg-red-500/5'}`}>
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2"><Badge type={v.type === 'payment_velocity' ? 'warning' : 'critical'}>{v.type.replace('_', ' ')}</Badge><span className="text-slate-400">{v.payer}</span></div>
                <h3 className="text-xl font-bold">{v.title}</h3>
              </div>
              <div className="text-right"><div className="text-3xl font-bold text-emerald-400">{fmt(v.principal + v.interest)}</div></div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs text-slate-500 uppercase mb-2">Contract Terms</h4>
              <div className="bg-slate-900/50 rounded p-3 space-y-2">
                <div><span className="text-xs text-cyan-400">{v.section}</span><p className="text-sm italic">"{v.contractText}"</p></div>
                <div><span className="text-xs text-amber-400">Penalty</span><p className="text-sm italic">"{v.penaltyText}"</p></div>
              </div>
            </div>
            <div>
              <h4 className="text-xs text-slate-500 uppercase mb-2">Analysis</h4>
              <div className="bg-slate-900/50 rounded p-3 grid grid-cols-2 gap-3">
                <div><div className="text-xs text-slate-500">Required</div><div className="text-emerald-400 font-semibold">{v.requirement}</div></div>
                <div><div className="text-xs text-slate-500">Actual</div><div className="text-red-400 font-semibold">{v.actual}</div></div>
                <div><div className="text-xs text-slate-500">Claims</div><div className="font-semibold">{v.claims.toLocaleString()}</div></div>
                <div><div className="text-xs text-slate-500">Gap</div><div className="text-amber-400 font-semibold">{v.gap}</div></div>
              </div>
              {v.interest > 0 && <div className="mt-3 text-xl font-bold text-amber-400">Interest: {fmt(v.interest)}</div>}
            </div>
          </div>
          <div className="px-5 pb-5 flex justify-between">
            <div className="flex gap-2">{v.agents.map(a => <AgentBadge key={a} name={a.replace('Agent', '')} />)}<Confidence v={v.confidence} /></div>
            <div className="flex gap-2">
              <button onClick={() => open('violation', v)} className="px-4 py-2 bg-slate-700 rounded flex items-center gap-2"><Eye className="w-4 h-4" />Evidence</button>
              <button onClick={() => open('letter', v)} className="px-5 py-2 bg-emerald-500 rounded font-medium flex items-center gap-2"><Send className="w-4 h-4" />Send Letter</button>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-5">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Gavel className="w-5 h-5 text-red-400" />Regulatory Violations</h3>
        {REGS.map(r => (
          <div key={r.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mb-3">
            <div className="flex justify-between">
              <div><span className="font-mono text-cyan-400">{r.code}</span> • {r.agency}<div className="font-semibold">{r.title}</div></div>
              <div className="text-right"><div className="text-slate-500">Settlement</div><div className="text-xl font-bold text-emerald-400">{pct(r.prob)}</div></div>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-slate-700">
              <span className="text-sm text-slate-400">{r.penalty}</span>
              <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">Generate Complaint</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// APPEALS TAB
function AppealsTab({ open }: { open: (type: string, data: Appeal) => void }) {
  const [filter, setFilter] = useState('all');
  const [showMethodology, setShowMethodology] = useState(false);
  const filtered = APPEALS.filter(a => (filter === 'all' || a.payer === filter) && a.ev > -200);

  // Risk quantification with confidence intervals
  const totalExpected = 425000;
  const expectedLower = 340000;  // 90% CI lower
  const expectedUpper = 510000;  // 90% CI upper
  const costToRecover = 45000;   // Staff time estimate
  const roi = Math.round(totalExpected / costToRecover);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appeal ROI Optimizer</h2>
        <div className="text-2xl font-bold text-emerald-400">$425K Expected Recovery</div>
      </div>
      
      {/* Risk Quantification with Confidence Intervals */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { l: 'Total Claims', v: '500', sub: 'Denied' },
          { l: 'Total Value', v: '$4.2M', sub: 'At stake' },
          { l: 'Expected Recovery', v: '$425K', c: 'text-emerald-400', sub: `90% CI: ${fmt(expectedLower)} - ${fmt(expectedUpper)}` },
          { l: 'Cost to Recover', v: '$45K', c: 'text-amber-400', sub: 'Est. staff time' },
          { l: 'Net ROI', v: `${roi}:1`, c: 'text-cyan-400', sub: `${fmt(totalExpected)} / ${fmt(costToRecover)}` }
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-sm text-slate-500">{s.l}</div>
            <div className={`text-2xl font-bold ${s.c || ''}`}>{s.v}</div>
            {s.sub && <div className="text-xs text-slate-500 mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* AI Discovery Summary - What AI Found That Humans Missed */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          What AI Found That Humans Missed
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Appeals prioritized manually (Q3):</span><span className="font-mono">FIFO order</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Appeals prioritized by AI:</span><span className="font-mono text-emerald-400">ROI-optimized</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Manual win rate (FIFO):</span><span className="font-mono">45%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">AI-optimized win rate (Top 50):</span><span className="font-mono text-emerald-400">78%</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Recovery from manual process:</span><span className="font-mono">$245K</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Additional recovery from AI:</span><span className="font-mono text-emerald-400">+$180K</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Time to prioritize (manual):</span><span className="font-mono">3 days</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Time to prioritize (AI):</span><span className="font-mono text-emerald-400">&lt; 2 minutes</span></div>
          </div>
        </div>
      </div>

      {/* AI Reasoning Panel */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-purple-300 mb-2">AI Reasoning (Chain of Thought)</div>
            <div className="text-sm text-slate-300 space-y-2">
              <div><span className="text-purple-400">1. Data Analysis:</span> Analyzed 72,000 claims from 835 remittance files</div>
              <div><span className="text-purple-400">2. Pattern Recognition:</span> Identified 500 denied claims with appeal potential</div>
              <div><span className="text-purple-400">3. Win Rate Modeling:</span> Applied CARC-specific win rates with payer multipliers (UHC 0.85x, Medicare 1.10x)</div>
              <div><span className="text-purple-400">4. ROI Optimization:</span> Ranked by Expected Value = Amount × Win Probability - Appeal Cost</div>
              <div><span className="text-purple-400">5. Recommendation:</span> Top 50 appeals have 78% win rate vs 12% for bottom 50. Focus resources on high-EV claims.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Rates by CARC with Confidence Intervals */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Win Rates by CARC (with Confidence Intervals)</h3>
          <button onClick={() => setShowMethodology(!showMethodology)} className="text-xs text-cyan-400 flex items-center gap-1">
            <Database className="w-3 h-3" />{showMethodology ? 'Hide' : 'Show'} Methodology
          </button>
        </div>
        
        {showMethodology && (
          <div className="bg-slate-900/50 rounded p-3 mb-4 text-xs text-slate-400">
            <div className="font-semibold text-slate-300 mb-2">How We Calculated This</div>
            <div>Win rates based on industry benchmarks from HFMA, AHA, and KFF research (2022-2024).</div>
            <div>Confidence intervals calculated using Wilson score interval at 95% confidence level.</div>
            <div>Payer-specific multipliers derived from historical appeal outcomes (n=12,847 appeals).</div>
            <div className="mt-2 text-slate-500">Analysis based on claims data through Dec 15, 2025</div>
          </div>
        )}
        
        <div className="grid grid-cols-6 gap-3">
          {WIN_RATES.map(w => (
            <div key={w.carc} className="bg-slate-900/50 rounded p-3">
              <div className="font-mono text-sm">{w.carc}</div>
              <div className="text-xs text-slate-500">{w.desc}</div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden my-2"><div className="h-full rounded-full" style={{ width: `${w.rate*100}%`, backgroundColor: w.color }} /></div>
              <div className="text-lg font-bold" style={{ color: w.color }}>{pct(w.rate)} <span className="text-xs font-normal text-slate-500">± {pct(w.margin)}</span></div>
              <div className="text-xs text-slate-500">(n={w.vol.toLocaleString()})</div>
              <div className="text-xs mt-1">
                <span className="text-slate-500">Industry: </span>
                <span className={w.rate > w.benchmark.industry ? 'text-emerald-400' : 'text-red-400'}>{pct(w.benchmark.industry)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
                <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm">
                  <option value="all">All Payers</option><option value="UHC">UHC</option><option value="Humana">Humana</option><option value="BCBS">BCBS</option><option value="Medicare">Medicare</option><option value="Aetna">Aetna</option><option value="Cigna">Cigna</option>
                </select>
        <button className="px-4 py-2 bg-emerald-500 rounded text-sm font-medium">Bulk Appeal Top 50</button>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>{['Rank', 'Claim', 'Payer', 'CARC', 'Amount', 'Win %', 'EV', 'Days', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filtered.map(a => (
              <tr key={a.id} className={a.ev < 0 ? 'bg-red-500/5' : a.rank <= 5 ? 'bg-emerald-500/5' : ''}>
                <td className="px-4 py-3"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${a.rank <= 5 ? 'bg-emerald-500' : a.ev < 0 ? 'bg-red-500/50' : 'bg-slate-700'}`}>{a.rank}</span></td>
                <td className="px-4 py-3"><div className="font-mono text-sm">{a.id}</div><div className="text-xs text-slate-500">{a.dos}</div></td>
                <td className="px-4 py-3 text-sm">{a.payer}</td>
                <td className="px-4 py-3"><div className="font-mono text-sm">{a.carc}</div></td>
                <td className="px-4 py-3 text-sm font-medium">{fmt(a.amount)}</td>
                <td className="px-4 py-3"><span className={a.prob >= 0.7 ? 'text-emerald-400' : a.prob >= 0.4 ? 'text-amber-400' : 'text-red-400'}>{pct(a.prob)}</span></td>
                <td className="px-4 py-3"><span className={a.ev >= 0 ? 'text-emerald-400' : 'text-red-400'}>{a.ev >= 0 ? '+' : ''}{fmt(Math.abs(a.ev))}</span></td>
                <td className="px-4 py-3"><span className={a.days < 14 ? 'text-red-400' : 'text-slate-400'}>{a.days}d</span></td>
                <td className="px-4 py-3">
                  {a.ev >= 0 ? <button onClick={() => open('appeal', a)} className="px-3 py-1.5 bg-emerald-500 text-xs font-medium rounded">Appeal</button> : <button className="px-3 py-1.5 bg-slate-700 text-slate-400 text-xs rounded">Write Off</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// RADAR TAB
function RadarTab() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">Policy Change Radar</h2>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />How AI Predicts</h3>
        <div className="grid grid-cols-4 gap-4">
          {[{ i: FileText, t: 'Earnings Calls' }, { i: Users, t: 'Competitors' }, { i: Building2, t: 'Bulletins' }, { i: Scale, t: 'Regulatory' }].map((x, i) => (
            <div key={i} className="bg-slate-900/50 rounded p-4 border border-slate-700/50"><x.i className="w-8 h-8 text-cyan-400 mb-2" /><div className="font-semibold">{x.t}</div></div>
          ))}
        </div>
      </div>

      {ALERTS.map(a => (
        <div key={a.id} className={`bg-slate-800/50 rounded-xl border-2 ${a.severity === 'critical' ? 'border-red-500/50' : 'border-amber-500/50'} overflow-hidden`}>
          <div className={`p-5 ${a.severity === 'critical' ? 'bg-red-500/5' : 'bg-amber-500/5'}`}>
            <div className="flex justify-between">
              <div><Badge type={a.severity}>{a.severity}</Badge> <span className="text-slate-400 ml-2">{a.payer}</span><h3 className="text-xl font-bold mt-2">{a.title}</h3></div>
              <div className="text-right"><div className="text-3xl font-bold">~{a.days} days</div><div className="text-slate-500">{pct(a.conf)} confidence</div></div>
            </div>
            <div className={`mt-4 p-3 rounded ${a.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>Impact: {fmt(a.impact)} if unprepared</div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs text-slate-500 uppercase mb-2">Signals</h4>
              {a.signals.map((s, i) => (
                <div key={i} className="bg-slate-900/50 rounded p-3 border border-slate-700/50 mb-2">
                  <div className="text-cyan-400 text-sm font-medium">{s.src}</div>
                  <p className="text-sm italic">{s.txt}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs text-slate-500 uppercase mb-2">Preparation</h4>
              {a.actions.map((act, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-900/50 rounded p-3 border border-slate-700/50 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-sm">{act}</span>
                </div>
              ))}
              <button className="mt-2 w-full py-3 bg-amber-500 font-semibold rounded">Start Preparation</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// NEGOTIATE TAB
function NegotiateTab() {
  const n = NEGO;
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">Negotiation Intelligence</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4"><div className="text-slate-500">Payer</div><div className="text-xl font-bold">{n.payer}</div></div>
        <div className="bg-slate-800/50 rounded-xl border border-amber-500/30 p-4"><div className="text-amber-400">Expires</div><div className="text-xl font-bold">{n.expires}</div><div className="text-sm text-slate-500">{n.daysLeft} days</div></div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4"><div className="text-emerald-400">Leverage</div><div className="text-3xl font-bold text-emerald-400">{n.leverage}/100</div></div>
        <div className="bg-cyan-500/10 rounded-xl border border-cyan-500/30 p-4"><div className="text-cyan-400">Opportunity</div><div className="text-3xl font-bold text-cyan-400">{fmt(n.opportunity)}</div></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-emerald-500/30 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-emerald-400" />Your Leverage</h3>
          {n.yourLeverage.map((l, i) => (
            <div key={i} className="bg-emerald-500/10 rounded p-3 flex justify-between mb-2"><span>{l.f}</span><span className="text-emerald-400 font-semibold">{l.v}</span></div>
          ))}
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowDownRight className="w-5 h-5 text-red-400" />Their Leverage</h3>
          {n.theirLeverage.map((l, i) => (
            <div key={i} className="bg-red-500/10 rounded p-3 flex justify-between mb-2"><span>{l.f}</span><span className="text-red-400 font-semibold">{l.v}</span></div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" />Rate Comparison</h3>
        <table className="w-full">
          <thead><tr className="text-xs text-slate-500 uppercase">{['Service', 'Your Rate', 'Market P50', 'Gap'].map(h => <th key={h} className="pb-3 text-left">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-700/50">
            {n.rates.map((r, i) => (
              <tr key={i}><td className="py-3">{r.svc}</td><td className="py-3 font-mono">{fmt(r.yours)}</td><td className="py-3 font-mono text-cyan-400">{fmt(r.market)}</td><td className="py-3 font-semibold text-red-400">{pct(r.gap)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />AI Playbook</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded p-4"><div className="text-slate-500">Opening</div><div className="text-3xl font-bold text-emerald-400">+{pct(n.strategy.open)}</div></div>
          <div className="bg-slate-900/50 rounded p-4"><div className="text-slate-500">Target</div><div className="text-3xl font-bold text-cyan-400">+{pct(n.strategy.target)}</div></div>
          <div className="bg-slate-900/50 rounded p-4"><div className="text-slate-500">Walk-Away</div><div className="text-3xl font-bold text-amber-400">+{pct(n.strategy.walk)}</div></div>
          <div className="bg-slate-900/50 rounded p-4"><div className="text-slate-500">BATNA</div><div className="text-sm">{n.strategy.batna}</div></div>
        </div>
        <h4 className="text-xs text-slate-500 uppercase mb-2">Talking Points</h4>
        <ul className="space-y-1">{n.points.map((p, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-emerald-400" />{p}</li>)}</ul>
      </div>
    </div>
  );
}

// FORECAST TAB
function ForecastTab() {
  const [forecast, setForecast] = useState<any>(null);
  const [serviceLines, setServiceLines] = useState<any>(null);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forecastRes, serviceLinesRes] = await Promise.all([
          fetch(`${API_BASE}/api/forecast/summary`),
          fetch(`${API_BASE}/api/forecast/service-lines`)
        ]);
        setForecast(await forecastRes.json());
        setServiceLines(await serviceLinesRes.json());
      } catch (e) {
        console.error('Failed to fetch forecast data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const runWhatIf = async (scenarioType: string, scenarioId?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/whatif/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_type: scenarioType, scenario_id: scenarioId })
      });
      setWhatIfResult(await res.json());
    } catch (e) {
      console.error('Failed to run what-if:', e);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-6 h-6 text-cyan-400" />Denial Forecast & Prevention</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Model Accuracy:</span>
          <span className="text-emerald-400 font-semibold">{forecast?.model_accuracy?.mape}% MAPE</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400">{(forecast?.model_accuracy?.directional_accuracy * 100).toFixed(0)}% directional</span>
        </div>
      </div>

      {/* Main Forecast Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="text-slate-500 text-sm">Current Quarterly</div>
          <div className="text-3xl font-bold">{forecast?.current?.formatted}</div>
          <div className="text-sm text-slate-400">{(forecast?.current?.denial_rate * 100).toFixed(1)}% denial rate</div>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <div className="text-red-400 text-sm">90-Day Forecast</div>
          <div className="text-3xl font-bold text-red-400">{forecast?.forecast_90_day?.formatted}</div>
          <div className="text-sm text-red-300">+{forecast?.forecast_90_day?.change_pct}% increase</div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <div className="text-emerald-400 text-sm">Preventable</div>
          <div className="text-3xl font-bold text-emerald-400">${(forecast?.preventable?.amount / 1_000_000).toFixed(1)}M</div>
          <div className="text-sm text-emerald-300">{forecast?.preventable?.percentage}% of forecast</div>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
          <div className="text-purple-400 text-sm">Data Quality</div>
          <div className="text-3xl font-bold text-purple-400">{(forecast?.validation?.data_quality?.score * 100).toFixed(0)}%</div>
          <div className="text-sm text-purple-300">High confidence</div>
        </div>
      </div>

      {/* Forecast Drivers */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" />Forecast Drivers</h3>
          <div className="space-y-3">
            {forecast?.forecast_90_day?.drivers?.map((d: any, i: number) => (
              <div key={i} className="bg-slate-900/50 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-500">Effective: {d.effective_date}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-semibold">+${(d.impact / 1_000_000).toFixed(1)}M</div>
                  <div className="text-xs text-slate-500">{(d.confidence * 100).toFixed(0)}% confidence</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-emerald-500/30 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-400" />Top Mitigation Opportunities</h3>
          <div className="space-y-3">
            {forecast?.preventable?.top_opportunities?.slice(0, 4).map((o: any, i: number) => (
              <div key={i} className="bg-emerald-500/10 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{o.action}</div>
                  <div className="text-xs text-slate-500">{o.time_to_implement}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-semibold">-${(o.reduction / 1_000_000).toFixed(1)}M</div>
                  <div className="text-xs text-emerald-300">{o.roi}x ROI</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Line Risk */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" />Service Line Risk Matrix</h3>
        <div className="grid grid-cols-5 gap-3">
          {serviceLines?.service_lines?.map((sl: any, i: number) => (
            <div key={i} className={`rounded-lg p-3 border ${sl.risk_level === 'high' ? 'bg-red-500/10 border-red-500/30' : sl.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <div className="font-medium">{sl.name}</div>
              <div className="text-xl font-bold">{sl.formatted}</div>
              <div className="flex justify-between text-xs mt-1">
                <span className={sl.risk_level === 'high' ? 'text-red-400' : sl.risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}>{sl.risk_level}</span>
                <span className={sl.trend === 'increasing' ? 'text-red-400' : 'text-slate-400'}>{sl.trend === 'increasing' ? '↑' : '→'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What-If Scenarios */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />What-If Scenarios</h3>
        <div className="flex gap-3 mb-4">
          <button onClick={() => runWhatIf('policy', 'humana_pa_2025')} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">What if Humana tightens PA?</button>
          <button onClick={() => runWhatIf('policy', 'uhc_med_nec_2025')} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">What if UHC updates med necessity?</button>
          <button onClick={() => runWhatIf('staffing', undefined)} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">What if we add 2 PA staff?</button>
          <button onClick={() => runWhatIf('planning', undefined)} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">Show planning scenarios</button>
        </div>
        
        {whatIfResult && (
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
            {whatIfResult.scenario_type === 'policy' && (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{whatIfResult.policy?.name}</div>
                    <div className="text-sm text-slate-500">Effective: {whatIfResult.policy?.effective_date}</div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">+${(whatIfResult.baseline_impact / 1_000_000).toFixed(1)}M impact</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-500/10 rounded p-3">
                    <div className="text-emerald-400 text-sm">Best Case</div>
                    <div className="text-xl font-bold">${(whatIfResult.best_case?.impact / 1_000_000).toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">{(whatIfResult.best_case?.probability * 100).toFixed(0)}% probability</div>
                  </div>
                  <div className="bg-amber-500/10 rounded p-3">
                    <div className="text-amber-400 text-sm">Likely Case</div>
                    <div className="text-xl font-bold">${(whatIfResult.likely_case?.impact / 1_000_000).toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">{(whatIfResult.likely_case?.probability * 100).toFixed(0)}% probability</div>
                  </div>
                  <div className="bg-red-500/10 rounded p-3">
                    <div className="text-red-400 text-sm">Worst Case</div>
                    <div className="text-xl font-bold">${(whatIfResult.worst_case?.impact / 1_000_000).toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">{(whatIfResult.worst_case?.probability * 100).toFixed(0)}% probability</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Mitigations</div>
                  <div className="space-y-2">
                    {whatIfResult.mitigations?.map((m: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-800/50 rounded p-2">
                        <span className="text-sm">{m.name}</span>
                        <span className="text-emerald-400 text-sm">-${(m.impact_reduction / 1_000_000).toFixed(1)}M ({m.roi}x ROI)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {whatIfResult.scenario_type === 'staffing' && (
              <>
                <div className="font-semibold">Staffing Scenario: Add {whatIfResult.fte_change} FTE to {whatIfResult.team?.replace('_', ' ')}</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/50 rounded p-3">
                    <div className="text-slate-400 text-sm">Investment</div>
                    <div className="text-xl font-bold">${(whatIfResult.investment?.total_first_year / 1_000).toFixed(0)}K</div>
                  </div>
                  <div className="bg-emerald-500/10 rounded p-3">
                    <div className="text-emerald-400 text-sm">Denial Reduction</div>
                    <div className="text-xl font-bold text-emerald-400">${(whatIfResult.financial_impact?.denial_reduction / 1_000_000).toFixed(1)}M</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded p-3">
                    <div className="text-cyan-400 text-sm">ROI</div>
                    <div className="text-xl font-bold text-cyan-400">{whatIfResult.financial_impact?.roi}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{whatIfResult.narrative}</p>
              </>
            )}
            {whatIfResult.scenario_type === 'planning' && (
              <>
                <div className="font-semibold">{whatIfResult.horizon_months}-Month Planning Scenarios</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-500/10 rounded p-3">
                    <div className="text-emerald-400 text-sm">Best Case</div>
                    <div className="text-xl font-bold">${(whatIfResult.best_case?.denials / 1_000_000).toFixed(0)}M</div>
                    <div className="text-xs text-slate-500">{(whatIfResult.best_case?.probability * 100).toFixed(0)}% probability</div>
                  </div>
                  <div className="bg-amber-500/10 rounded p-3">
                    <div className="text-amber-400 text-sm">Likely Case</div>
                    <div className="text-xl font-bold">${(whatIfResult.likely_case?.denials / 1_000_000).toFixed(0)}M</div>
                    <div className="text-xs text-slate-500">{(whatIfResult.likely_case?.probability * 100).toFixed(0)}% probability</div>
                  </div>
                  <div className="bg-red-500/10 rounded p-3">
                    <div className="text-red-400 text-sm">Worst Case</div>
                    <div className="text-xl font-bold">${(whatIfResult.worst_case?.denials / 1_000_000).toFixed(0)}M</div>
                    <div className="text-xs text-slate-500">{(whatIfResult.worst_case?.probability * 100).toFixed(0)}% probability</div>
                  </div>
                </div>
                <p className="text-sm text-cyan-300 bg-cyan-500/10 rounded p-3">{whatIfResult.recommendation}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// AGENTS TAB - Comprehensive view of all AI agents
function AgentsTab() {
  const [denialForecast, setDenialForecast] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [forecastAccuracy, setForecastAccuracy] = useState<any>(null);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [assumptions, setAssumptions] = useState<any>(null);
  const [confidence, setConfidence] = useState<any>(null);
  const [rootCause, setRootCause] = useState<any>(null);
  const [nlWhatIf, setNlWhatIf] = useState<any>(null);
  const [nlQuestion, setNlQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState('denial-forecast');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forecastRes, cashFlowRes, accuracyRes, qualityRes, assumptionsRes, confidenceRes] = await Promise.all([
          fetch(`${API_BASE}/api/agents/denial-forecast`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ horizon_days: 90 }) }),
          fetch(`${API_BASE}/api/agents/cash-flow-impact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ horizon_months: 3 }) }),
          fetch(`${API_BASE}/api/agents/forecast-accuracy-validator`),
          fetch(`${API_BASE}/api/agents/data-quality-validator`),
          fetch(`${API_BASE}/api/agents/assumption-validator`),
          fetch(`${API_BASE}/api/agents/confidence-aggregator`)
        ]);
        setDenialForecast(await forecastRes.json());
        setCashFlow(await cashFlowRes.json());
        setForecastAccuracy(await accuracyRes.json());
        setDataQuality(await qualityRes.json());
        setAssumptions(await assumptionsRes.json());
        setConfidence(await confidenceRes.json());
      } catch (e) {
        console.error('Failed to fetch agent data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const runRootCause = async (pattern: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/agents/root-cause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denial_pattern: pattern })
      });
      setRootCause(await res.json());
      setActiveAgent('root-cause');
    } catch (e) {
      console.error('Failed to run root cause:', e);
    }
  };

  const runNlWhatIf = async () => {
    if (!nlQuestion.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/agents/nl-whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: nlQuestion })
      });
      setNlWhatIf(await res.json());
      setActiveAgent('nl-whatif');
    } catch (e) {
      console.error('Failed to run NL what-if:', e);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-6 h-6 text-purple-400" />AI Agent Intelligence Center</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">System Confidence:</span>
          <span className={`font-semibold ${confidence?.confidence_tier === 'HIGH' ? 'text-emerald-400' : confidence?.confidence_tier === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'}`}>
            {(confidence?.adjusted_confidence * 100).toFixed(0)}% ({confidence?.confidence_tier})
          </span>
        </div>
      </div>

      {/* Agent Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'denial-forecast', label: 'Denial Forecast', icon: TrendingUp },
          { id: 'cash-flow', label: 'Cash Flow Impact', icon: DollarSign },
          { id: 'validators', label: 'Validators', icon: CheckCircle },
          { id: 'root-cause', label: 'Root Cause', icon: Search },
          { id: 'nl-whatif', label: 'Natural Language What-If', icon: Brain }
        ].map(a => (
          <button key={a.id} onClick={() => setActiveAgent(a.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeAgent === a.id ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'}`}>
            <a.icon className="w-4 h-4" />{a.label}
          </button>
        ))}
      </div>

      {/* Denial Forecast Agent */}
      {activeAgent === 'denial-forecast' && denialForecast && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400" />Denial Forecast Agent</h3>
                <p className="text-sm text-slate-500">Model: {denialForecast.model_used}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-400">${(denialForecast.point_forecast / 1_000_000).toFixed(1)}M</div>
                <div className="text-sm text-slate-400">{denialForecast.horizon_days}-day forecast</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Lower Bound</div>
                <div className="text-xl font-bold">${(denialForecast.confidence_interval?.lower / 1_000_000).toFixed(1)}M</div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-400 text-sm">Point Forecast</div>
                <div className="text-xl font-bold text-red-400">${(denialForecast.point_forecast / 1_000_000).toFixed(1)}M</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Upper Bound</div>
                <div className="text-xl font-bold">${(denialForecast.confidence_interval?.upper / 1_000_000).toFixed(1)}M</div>
              </div>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
              <p className="text-sm text-cyan-300">{denialForecast.narrative}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key Drivers</h4>
              <div className="space-y-2">
                {denialForecast.drivers?.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                    <div>
                      <span className="font-medium">{d.factor}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${d.preventable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {d.preventable ? 'Preventable' : 'External'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-medium">+${(d.impact / 1_000_000).toFixed(1)}M</span>
                      <span className="text-slate-500 text-sm ml-2">{(d.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Impact Agent */}
      {activeAgent === 'cash-flow' && cashFlow && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" />Cash Flow Impact Agent</h3>
                <p className="text-sm text-slate-500">Model: {cashFlow.model_used}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-400 text-sm">Denial Forecast</div>
                <div className="text-xl font-bold text-red-400">{cashFlow.denial_forecast?.formatted}</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
                <div className="text-emerald-400 text-sm">Expected Recovery</div>
                <div className="text-xl font-bold text-emerald-400">${(cashFlow.cash_flow_projection?.expected_recovery / 1_000_000).toFixed(1)}M</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                <div className="text-amber-400 text-sm">Pending A/R</div>
                <div className="text-xl font-bold text-amber-400">${(cashFlow.cash_flow_projection?.pending_ar / 1_000_000).toFixed(1)}M</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Expected Write-off</div>
                <div className="text-xl font-bold">${(cashFlow.cash_flow_projection?.expected_writeoff / 1_000_000).toFixed(1)}M</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">A/R Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-slate-400">Current Days A/R</span><span>{cashFlow.ar_metrics?.current_days_ar} days</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Projected Days A/R</span><span className="text-amber-400">{cashFlow.ar_metrics?.projected_days_ar} days</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Target</span><span className="text-emerald-400">{cashFlow.ar_metrics?.target_days_ar} days</span></div>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Bad Debt Reserve</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-slate-400">Current</span><span>${(cashFlow.bad_debt_reserve?.current / 1_000_000).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Recommended</span><span className="text-amber-400">${(cashFlow.bad_debt_reserve?.recommended / 1_000_000).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Adjustment Needed</span><span className="text-red-400">+${(cashFlow.bad_debt_reserve?.adjustment_needed / 1_000_000).toFixed(1)}M</span></div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
              <p className="text-sm text-cyan-300">{cashFlow.narrative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validators */}
      {activeAgent === 'validators' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Forecast Accuracy Validator */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" />Forecast Accuracy Validator</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">MAPE</div>
                <div className="text-2xl font-bold text-emerald-400">{forecastAccuracy?.accuracy_metrics?.mape}%</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Directional</div>
                <div className="text-2xl font-bold">{(forecastAccuracy?.accuracy_metrics?.directional_accuracy * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
              <p className="text-sm text-emerald-300">{forecastAccuracy?.confidence_statement}</p>
            </div>
          </div>

          {/* Data Quality Validator */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-purple-400" />Data Quality Validator</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Overall</div>
                <div className="text-2xl font-bold text-purple-400">{(dataQuality?.overall_score * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Completeness</div>
                <div className="text-xl font-bold">{(dataQuality?.completeness?.score * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-500 text-sm">Timeliness</div>
                <div className="text-xl font-bold">{(dataQuality?.timeliness?.score * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">{dataQuality?.recommendation}</div>
          </div>

          {/* Assumption Validator */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-amber-400" />Assumption Validator</h3>
            <div className="space-y-2">
              {assumptions?.assumptions?.slice(0, 4).map((a: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                  <span className="text-sm">{a.assumption}</span>
                  <span className={`text-sm font-medium ${a.validity_score > 0.85 ? 'text-emerald-400' : a.validity_score > 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                    {(a.validity_score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-amber-300">{assumptions?.recommendation}</div>
          </div>

          {/* Confidence Aggregator */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-cyan-400" />Confidence Aggregator</h3>
            <div className="text-center mb-4">
              <div className={`text-4xl font-bold ${confidence?.confidence_tier === 'HIGH' ? 'text-emerald-400' : confidence?.confidence_tier === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'}`}>
                {(confidence?.adjusted_confidence * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">{confidence?.tier_description}</div>
            </div>
            <div className="space-y-2">
              {confidence?.adjustments?.map((a: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{a.reason}</span>
                  <span className={a.adjustment > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {a.adjustment > 0 ? '+' : ''}{(a.adjustment * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Root Cause Agent */}
      {activeAgent === 'root-cause' && (
        <div className="space-y-4">
          <div className="flex gap-3 mb-4">
            <button onClick={() => runRootCause('prior_auth')} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">Prior Auth Denials</button>
            <button onClick={() => runRootCause('medical_necessity')} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">Medical Necessity</button>
            <button onClick={() => runRootCause('coding')} className="px-4 py-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm">Coding Errors</button>
          </div>
          {rootCause && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><Search className="w-5 h-5 text-amber-400" />Root Cause Analysis</h3>
                  <p className="text-sm text-slate-500">{rootCause.pattern}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">${(rootCause.total_preventable / 1_000_000).toFixed(1)}M</div>
                  <div className="text-sm text-slate-400">Preventable ({(rootCause.prevention_rate * 100).toFixed(0)}%)</div>
                </div>
              </div>
              <div className="space-y-3">
                {rootCause.root_causes?.map((rc: any, i: number) => (
                  <div key={i} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{rc.cause}</div>
                      <div className="text-emerald-400 font-medium">${(rc.estimated_impact / 1_000_000).toFixed(1)}M impact</div>
                    </div>
                    <div className="text-sm text-slate-400 mb-2">{rc.evidence}</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-400">Intervention: {rc.intervention}</span>
                      <span className="text-slate-500">Owner: {rc.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                <p className="text-sm text-amber-300">{rootCause.narrative}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Natural Language What-If */}
      {activeAgent === 'nl-whatif' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-purple-400" />Natural Language What-If Engine</h3>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={nlQuestion}
                onChange={(e) => setNlQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && runNlWhatIf()}
                placeholder="Ask a what-if question... e.g., 'What if Humana changes their PA policy?'"
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
              <button onClick={runNlWhatIf} className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 text-sm font-medium">Analyze</button>
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {['What if Humana changes their PA policy?', 'What if we add 2 FTEs?', 'What if UHC denials increase 20%?'].map((q, i) => (
                <button key={i} onClick={() => { setNlQuestion(q); }} className="px-3 py-1 bg-slate-700/50 rounded text-xs hover:bg-slate-700">{q}</button>
              ))}
            </div>
            {nlWhatIf && (
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="mb-3">
                  <span className="text-slate-500 text-sm">Interpreted as:</span>
                  <span className="ml-2 font-medium">{nlWhatIf.interpreted_as}</span>
                </div>
                {nlWhatIf.analysis && (
                  <div className="space-y-3">
                    {nlWhatIf.analysis.if_no_action && (
                      <div className="bg-red-500/10 rounded p-3 border border-red-500/30">
                        <div className="text-red-400 text-sm font-medium">If No Action</div>
                        <div className="text-xl font-bold text-red-400">${(nlWhatIf.analysis.if_no_action.impact / 1_000_000).toFixed(1)}M impact</div>
                        <div className="text-sm text-slate-400">{nlWhatIf.analysis.if_no_action.description}</div>
                      </div>
                    )}
                    {nlWhatIf.analysis.if_mitigated && (
                      <div className="bg-emerald-500/10 rounded p-3 border border-emerald-500/30">
                        <div className="text-emerald-400 text-sm font-medium">If Mitigated</div>
                        <div className="text-xl font-bold text-emerald-400">${(nlWhatIf.analysis.if_mitigated.impact / 1_000_000).toFixed(1)}M impact</div>
                        <div className="text-sm text-slate-400">{nlWhatIf.analysis.if_mitigated.description}</div>
                      </div>
                    )}
                  </div>
                )}
                {nlWhatIf.follow_up_questions && (
                  <div className="mt-4">
                    <div className="text-sm text-slate-500 mb-2">Follow-up questions:</div>
                    <div className="space-y-1">
                      {nlWhatIf.follow_up_questions.map((q: string, i: number) => (
                        <div key={i} className="text-sm text-cyan-400">• {q}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// EXECUTIVE DASHBOARD - 3-Level Drill-Down
function ExecutiveDashboard() {
  const [drillLevel, setDrillLevel] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  
  const totalRecoverable = VIOLATIONS.reduce((s, v) => s + v.principal + v.interest, 0);
  const appealRecovery = 425000;
  const policyRisk = 2300000;
  
  const categories = [
    { id: 'violations', name: 'Contract Violations', amount: totalRecoverable, confidence: 0.92, claims: VIOLATIONS.reduce((s, v) => s + v.claims, 0), color: 'emerald', icon: Gavel },
    { id: 'appeals', name: 'Appeal Optimization', amount: appealRecovery, confidence: 0.78, claims: 500, color: 'cyan', icon: Target },
    { id: 'policy', name: 'Policy Change Impact', amount: policyRisk, confidence: 0.65, claims: 847, color: 'amber', icon: Radar }
  ];
  
  const claimDetails = [
    { id: 'CLM-001', payer: 'UHC', amount: 12400, type: 'Payment Velocity', evidence: ['Contract §4.2', '835 Data', 'Similar Cases: 14'], confidence: 0.94 },
    { id: 'CLM-002', payer: 'UHC', amount: 8900, type: 'Criteria Change', evidence: ['Contract §7.1', 'Policy Docs', 'InterQual Mismatch'], confidence: 0.89 },
    { id: 'CLM-003', payer: 'Humana', amount: 9800, type: 'Payment Velocity', evidence: ['Contract §5.3', '835 Data', 'Interest Calc'], confidence: 0.92 }
  ];
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Layers className="w-7 h-7 text-purple-400" />
          Executive Dashboard
          <span className="text-sm font-normal text-slate-500">3-Level Drill-Down</span>
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => { setDrillLevel(1); setSelectedCategory(null); setSelectedClaim(null); }} className={`px-3 py-1 rounded ${drillLevel >= 1 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>Level 1: Total</button>
          <span className="text-slate-600">→</span>
          <button onClick={() => drillLevel >= 2 && setDrillLevel(2)} className={`px-3 py-1 rounded ${drillLevel >= 2 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>Level 2: Category</button>
          <span className="text-slate-600">→</span>
          <button onClick={() => drillLevel >= 3 && setDrillLevel(3)} className={`px-3 py-1 rounded ${drillLevel === 3 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>Level 3: Claims</button>
        </div>
      </div>
      
      {/* Level 1: Total Recoverable */}
      {drillLevel === 1 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="text-slate-400 mb-2">Total Recoverable Revenue</div>
            <div className="text-6xl font-bold text-emerald-400 mb-4">{fmt(totalRecoverable + appealRecovery + policyRisk)}</div>
            <div className="text-slate-400">90% CI: {fmt((totalRecoverable + appealRecovery + policyRisk) * 0.85)} - {fmt((totalRecoverable + appealRecovery + policyRisk) * 1.15)}</div>
            <div className="mt-4 text-sm text-slate-500">Click a category below to drill down</div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setDrillLevel(2); setSelectedCategory(cat.id); }} className={`bg-${cat.color}-500/10 border border-${cat.color}-500/30 rounded-xl p-6 text-left hover:border-${cat.color}-400 transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <cat.icon className={`w-6 h-6 text-${cat.color}-400`} />
                  <span className="font-semibold">{cat.name}</span>
                </div>
                <div className={`text-3xl font-bold text-${cat.color}-400 mb-2`}>{fmt(cat.amount)}</div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{cat.claims.toLocaleString()} claims</span>
                  <span>Confidence: {pct(cat.confidence)}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />AI Confidence Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm">High Confidence (&gt;90%)</div>
                <div className="text-2xl font-bold text-emerald-400">{fmt(totalRecoverable * 0.7)}</div>
                <div className="text-xs text-slate-500">Ready to action</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Medium Confidence (70-90%)</div>
                <div className="text-2xl font-bold text-amber-400">{fmt(totalRecoverable * 0.25)}</div>
                <div className="text-xs text-slate-500">Review recommended</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Low Confidence (&lt;70%)</div>
                <div className="text-2xl font-bold text-red-400">{fmt(totalRecoverable * 0.05)}</div>
                <div className="text-xs text-slate-500">Manual validation required</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Level 2: By Category */}
      {drillLevel === 2 && selectedCategory && (
        <div className="space-y-6">
          <button onClick={() => { setDrillLevel(1); setSelectedCategory(null); }} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">← Back to Total</button>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">{categories.find(c => c.id === selectedCategory)?.name}</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{fmt(categories.find(c => c.id === selectedCategory)?.amount || 0)}</div>
            <div className="text-slate-400">Click a claim to see supporting evidence</div>
          </div>
          
          <div className="space-y-3">
            {claimDetails.map(claim => (
              <button key={claim.id} onClick={() => { setDrillLevel(3); setSelectedClaim(claim.id); }} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left hover:border-cyan-500/50 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{claim.id}</div>
                    <div className="text-sm text-slate-400">{claim.payer} • {claim.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">{fmt(claim.amount)}</div>
                    <div className="text-sm text-slate-400">Confidence: {pct(claim.confidence)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Level 3: Individual Claims with Evidence */}
      {drillLevel === 3 && selectedClaim && (
        <div className="space-y-6">
          <button onClick={() => { setDrillLevel(2); setSelectedClaim(null); }} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">← Back to Category</button>
          
          {(() => {
            const claim = claimDetails.find(c => c.id === selectedClaim);
            if (!claim) return null;
            return (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{claim.id}</h3>
                    <div className="text-slate-400">{claim.payer} • {claim.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">{fmt(claim.amount)}</div>
                    <div className="text-sm text-slate-400">Confidence: {pct(claim.confidence)}</div>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-400" />Supporting Evidence</h4>
                <div className="grid grid-cols-3 gap-3">
                  {claim.evidence.map((ev, i) => (
                    <div key={i} className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// MODEL PERFORMANCE TAB
function ModelPerformanceTab() {
  const monthlyData = [
    { month: 'Jul 2024', predicted: 1200000, actual: 1150000, accuracy: 0.96 },
    { month: 'Aug 2024', predicted: 1350000, actual: 1280000, accuracy: 0.95 },
    { month: 'Sep 2024', predicted: 1180000, actual: 1220000, accuracy: 0.97 },
    { month: 'Oct 2024', predicted: 1420000, actual: 1380000, accuracy: 0.97 },
    { month: 'Nov 2024', predicted: 1550000, actual: 1490000, accuracy: 0.96 },
    { month: 'Dec 2024', predicted: 1680000, actual: null, accuracy: null }
  ];
  
  const carcAccuracy = [
    { carc: 'CO-16', predicted: 0.78, actual: 0.76, accuracy: 0.97 },
    { carc: 'CO-197', predicted: 0.68, actual: 0.71, accuracy: 0.96 },
    { carc: 'OA-23', predicted: 0.52, actual: 0.49, accuracy: 0.94 },
    { carc: 'CO-97', predicted: 0.45, actual: 0.43, accuracy: 0.96 },
    { carc: 'CO-4', predicted: 0.22, actual: 0.24, accuracy: 0.92 },
    { carc: 'PR-1', predicted: 0.08, actual: 0.07, accuracy: 0.88 }
  ];
  
  const payerAccuracy = [
    { payer: 'UHC', predicted: 0.72, actual: 0.69, accuracy: 0.96, claims: 4247 },
    { payer: 'Humana', predicted: 0.68, actual: 0.70, accuracy: 0.97, claims: 2891 },
    { payer: 'BCBS', predicted: 0.75, actual: 0.73, accuracy: 0.97, claims: 1823 },
    { payer: 'Medicare', predicted: 0.82, actual: 0.85, accuracy: 0.96, claims: 3456 },
    { payer: 'Aetna', predicted: 0.65, actual: 0.62, accuracy: 0.95, claims: 1234 },
    { payer: 'Cigna', predicted: 0.70, actual: 0.68, accuracy: 0.97, claims: 987 }
  ];
  
  const overallAccuracy = 0.96;
  const totalRecovery = 6520000;
  const costToRecover = 138000;
  const roi = totalRecovery / costToRecover;
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <Activity className="w-7 h-7 text-cyan-400" />
        Model Performance
        <span className="text-sm font-normal text-slate-500">Backtesting & Validation</span>
      </h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <div className="text-slate-400 text-sm">Overall Accuracy</div>
          <div className="text-4xl font-bold text-emerald-400">{pct(overallAccuracy)}</div>
          <div className="text-xs text-slate-500">Last 6 months</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5">
          <div className="text-slate-400 text-sm">Total Recovery</div>
          <div className="text-4xl font-bold text-cyan-400">{fmt(totalRecovery)}</div>
          <div className="text-xs text-slate-500">YTD actual</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <div className="text-slate-400 text-sm">Cost to Recover</div>
          <div className="text-4xl font-bold text-amber-400">{fmt(costToRecover)}</div>
          <div className="text-xs text-slate-500">Staff time + tools</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
          <div className="text-slate-400 text-sm">Net ROI</div>
          <div className="text-4xl font-bold text-purple-400">{roi.toFixed(0)}:1</div>
          <div className="text-xs text-slate-500">{fmt(totalRecovery)} / {fmt(costToRecover)}</div>
        </div>
      </div>
      
      {/* Predicted vs Actual by Month */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" />Predicted vs Actual Recovery by Month</h3>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 uppercase">
              <th className="pb-3 text-left">Month</th>
              <th className="pb-3 text-right">Predicted</th>
              <th className="pb-3 text-right">Actual</th>
              <th className="pb-3 text-right">Variance</th>
              <th className="pb-3 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {monthlyData.map((m, i) => (
              <tr key={i}>
                <td className="py-3">{m.month}</td>
                <td className="py-3 text-right font-mono">{fmt(m.predicted)}</td>
                <td className="py-3 text-right font-mono">{m.actual ? fmt(m.actual) : <span className="text-slate-500">Pending</span>}</td>
                <td className="py-3 text-right font-mono">{m.actual ? <span className={m.actual >= m.predicted ? 'text-emerald-400' : 'text-red-400'}>{m.actual >= m.predicted ? '+' : ''}{fmt(m.actual - m.predicted)}</span> : '-'}</td>
                <td className="py-3 text-right">{m.accuracy ? <span className="text-emerald-400">{pct(m.accuracy)}</span> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Accuracy by CARC Code */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-400" />Accuracy by CARC Code</h3>
          <div className="space-y-3">
            {carcAccuracy.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm">{c.carc}</span>
                  <span className="text-xs text-slate-500 ml-2">Pred: {pct(c.predicted)} | Act: {pct(c.actual)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${c.accuracy * 100}%` }} />
                  </div>
                  <span className="text-sm text-emerald-400 w-12 text-right">{pct(c.accuracy)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-cyan-400" />Accuracy by Payer</h3>
          <div className="space-y-3">
            {payerAccuracy.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm">{p.payer}</span>
                  <span className="text-xs text-slate-500 ml-2">{p.claims.toLocaleString()} claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${p.accuracy * 100}%` }} />
                  </div>
                  <span className="text-sm text-cyan-400 w-12 text-right">{pct(p.accuracy)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// SIMULATION MODE TAB
function SimulationModeTab() {
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const runSimulation = () => {
    setAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setResults({
        claimsAnalyzed: 72847,
        violationsFound: 47,
        missedByManual: 35,
        recoverable: 2340000,
        leftOnTable: 1890000,
        topMissed: [
          { id: 'CLM-8847', payer: 'UHC', amount: 45000, reason: 'Payment velocity 42 days vs 30 day contract' },
          { id: 'CLM-7723', payer: 'Humana', amount: 38000, reason: 'Unauthorized criteria change detected' },
          { id: 'CLM-9912', payer: 'BCBS', amount: 28000, reason: 'Interest accrual not claimed' }
        ]
      });
      setAnalyzing(false);
    }, 3000);
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <Upload className="w-7 h-7 text-amber-400" />
        Simulation Mode
        <span className="text-sm font-normal text-slate-500">Upload your 835 files to see what you're missing</span>
      </h2>
      
      {!results ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-2xl p-12 text-center hover:border-amber-500/50 cursor-pointer transition-all"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".835,.txt,.edi"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <div className="text-xl font-semibold mb-2">Upload 835 Remittance Files</div>
            <div className="text-slate-400 mb-4">Drag and drop or click to select files</div>
            <div className="text-sm text-slate-500">Recommended: 90 days of 835 files for comprehensive analysis</div>
          </div>
          
          {files.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="font-semibold mb-3">{files.length} files selected</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <FileText className="w-4 h-4" />
                    {f.name}
                    <span className="text-slate-600">({(f.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={runSimulation}
                disabled={analyzing}
                className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            </div>
          )}
          
          {analyzing && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
              <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <div className="text-xl font-semibold mb-2">AI Analyzing Your Claims...</div>
              <div className="text-slate-400">Scanning for contract violations, missed appeals, and underpayments</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-slate-400 mb-2">You Left Money on the Table</div>
              <div className="text-6xl font-bold text-red-400">{fmt(results.leftOnTable)}</div>
              <div className="text-slate-400 mt-2">Based on {results.claimsAnalyzed.toLocaleString()} claims analyzed</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">{results.violationsFound}</div>
                <div className="text-sm text-slate-400">Violations Found</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{results.missedByManual}</div>
                <div className="text-sm text-slate-400">Missed by Manual Review</div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">{fmt(results.recoverable)}</div>
                <div className="text-sm text-slate-400">Total Recoverable</div>
              </div>
            </div>
          </div>
          
          {/* What AI Found That Humans Missed */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Top Claims You Missed
            </h3>
            <div className="space-y-3">
              {results.topMissed.map((claim: any, i: number) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{claim.id} • {claim.payer}</div>
                    <div className="text-sm text-slate-400">{claim.reason}</div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{fmt(claim.amount)}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => { setFiles([]); setResults(null); }} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold">
              Upload New Files
            </button>
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// MODALS
// Approval thresholds and high-value payer relationships
const APPROVAL_THRESHOLDS = {
  autoApprove: 10000,      // Auto-approve < $10K
  managerApprove: 50000,   // Manager approval $10K-$50K
  execApprove: 100000,     // Executive approval $50K-$100K
  legalRequired: 100000    // Legal review required > $100K
};

const HIGH_VALUE_PAYERS = ['UHC', 'BCBS', 'Aetna']; // Strategic relationships requiring exec review

function getApprovalRequirement(amount: number, payer: string, confidence: number): { level: string; blocked: boolean; reason: string } {
  // Low confidence always requires validation
  if (confidence < 0.7) {
    return { level: 'validation', blocked: true, reason: 'Low confidence score requires manual validation before sending' };
  }
  
  // High-value payer relationships require exec review regardless of amount
  if (HIGH_VALUE_PAYERS.includes(payer) && amount > APPROVAL_THRESHOLDS.autoApprove) {
    return { level: 'executive', blocked: true, reason: `${payer} is a high-value payer relationship - executive approval required` };
  }
  
  // Amount-based thresholds
  if (amount >= APPROVAL_THRESHOLDS.legalRequired) {
    return { level: 'legal', blocked: true, reason: 'Amount exceeds $100K - legal/compliance review required' };
  }
  if (amount >= APPROVAL_THRESHOLDS.execApprove) {
    return { level: 'executive', blocked: true, reason: 'Amount exceeds $50K - executive approval required' };
  }
  if (amount >= APPROVAL_THRESHOLDS.managerApprove) {
    return { level: 'manager', blocked: true, reason: 'Amount exceeds $10K - manager approval required' };
  }
  
  return { level: 'auto', blocked: false, reason: 'Auto-approved: amount under $10K with high confidence' };
}

function LetterModal({ data, close }: { data: Violation; close: () => void }) {
  const letter = DEMAND_LETTERS[data.id];
  const [body, setBody] = useState(letter?.body || '');
  const [editing, setEditing] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'requested' | 'approved' | 'rejected'>('pending');
  // Reserved for future approval form implementation
  const [_approvalNotes, _setApprovalNotes] = useState('');
  const [_showApprovalForm, _setShowApprovalForm] = useState(false);
  void _approvalNotes; void _setApprovalNotes; void _showApprovalForm; void _setShowApprovalForm;
  
  if (!letter) return null;
  
  const totalAmount = data.principal + data.interest;
  const approval = getApprovalRequirement(totalAmount, data.payer, data.confidence);
  const canSend = !approval.blocked || approvalStatus === 'approved';
  
  const requestApproval = () => {
    setApprovalStatus('requested');
    // In production, this would send to approval workflow system
    alert(`Approval request sent to ${approval.level} level.\n\nAmount: ${fmt(totalAmount)}\nPayer: ${data.payer}\nReason: ${approval.reason}\n\nYou will be notified when approved.`);
  };
  
  const simulateApproval = () => {
    // For demo purposes - in production this would come from approval system
    setApprovalStatus('approved');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-5 border-b border-slate-700 flex justify-between">
          <div>
            <h2 className="text-xl font-bold">Demand Letter</h2>
            <p className="text-slate-500">AI-generated • {canSend ? 'Ready to send' : 'Approval required'}</p>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        
        {/* APPROVAL WORKFLOW BANNER - BLOCKS SEND IF NOT APPROVED */}
        {approval.blocked && (
          <div className={`p-4 border-b ${approvalStatus === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' : approvalStatus === 'requested' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-start gap-3">
              {approvalStatus === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : approvalStatus === 'requested' ? (
                <Loader2 className="w-5 h-5 text-amber-400 mt-0.5 animate-spin" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`font-semibold ${approvalStatus === 'approved' ? 'text-emerald-400' : approvalStatus === 'requested' ? 'text-amber-400' : 'text-red-400'}`}>
                  {approvalStatus === 'approved' ? 'APPROVED - Ready to Send' : approvalStatus === 'requested' ? 'APPROVAL PENDING' : `BLOCKED - ${approval.level.toUpperCase()} APPROVAL REQUIRED`}
                </div>
                <div className="text-sm text-slate-300 mt-1">{approval.reason}</div>
                <div className="text-xs text-slate-500 mt-2">
                  Amount: {fmt(totalAmount)} | Payer: {data.payer} | Confidence: {pct(data.confidence)}
                </div>
                {approvalStatus === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={requestApproval} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded text-sm font-medium flex items-center gap-2">
                      <Send className="w-4 h-4" />Request {approval.level} Approval
                    </button>
                    <button onClick={simulateApproval} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300">
                      (Demo: Simulate Approval)
                    </button>
                  </div>
                )}
                {approvalStatus === 'requested' && (
                  <div className="mt-3 flex gap-2">
                    <span className="text-sm text-amber-300">Waiting for {approval.level} approval...</span>
                    <button onClick={simulateApproval} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300">
                      (Demo: Simulate Approval)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-auto p-5">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 mb-4 flex gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <div className="text-sm text-purple-300"><strong>AI:</strong> Based on {data.section}, {data.claims.toLocaleString()} claims. Confidence: {pct(data.confidence)}</div>
          </div>
          
          {/* Data Source Attribution */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Database className="w-4 h-4" />
              <span>Data Sources & Methodology</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Win rates based on industry benchmarks from HFMA, AHA, and KFF research (2022-2024)</div>
              <div>Analysis based on claims data through Dec 15, 2025</div>
              <div>Contract reference: {data.section} | {data.claims.toLocaleString()} claims analyzed</div>
            </div>
          </div>
          
          <div className="mb-4"><div className="text-sm text-slate-500">To:</div><div className="font-medium">{letter.to}</div></div>
          <div className="mb-4"><div className="text-sm text-slate-500">Subject:</div><div className="font-medium">{letter.subject}</div></div>
          <div className="mb-4">
            <div className="flex justify-between mb-1"><span className="text-sm text-slate-500">Body:</span><button onClick={() => setEditing(!editing)} className="text-xs text-cyan-400">{editing ? 'Preview' : 'Edit'}</button></div>
            {editing ? <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-64 bg-slate-800 border border-slate-700 rounded p-4 text-sm font-mono" /> : <div className="bg-slate-800 rounded p-4 text-sm font-mono whitespace-pre-wrap max-h-64 overflow-auto">{body}</div>}
          </div>
          <div><div className="text-sm text-slate-500 mb-2">Attachments:</div><div className="flex gap-2">{letter.attachments.map(a => <span key={a} className="px-3 py-1.5 bg-slate-800 rounded text-sm flex items-center gap-2"><FileText className="w-4 h-4" />{a}</span>)}</div></div>
        </div>
        <div className="p-5 border-t border-slate-700 flex justify-between">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-700 rounded flex items-center gap-2"><Download className="w-4 h-4" />PDF</button>
            <button className="px-4 py-2 bg-slate-700 rounded flex items-center gap-2"><Copy className="w-4 h-4" />Copy</button>
          </div>
          {canSend ? (
            <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded font-semibold flex items-center gap-2">
              <Send className="w-4 h-4" />Send Now
            </button>
          ) : (
            <button disabled className="px-6 py-2 bg-slate-700 text-slate-500 rounded font-semibold flex items-center gap-2 cursor-not-allowed">
              <AlertTriangle className="w-4 h-4" />Approval Required
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ViolationModal({ data, close, open }: { data: Violation; close: () => void; open: (type: string, data: Violation) => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-5 border-b border-slate-700 flex justify-between">
          <div><h2 className="text-xl font-bold">{data.title}</h2><p className="text-slate-500">{data.payer} • {data.section}</p></div>
          <button onClick={close} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-6">
          <div><h3 className="text-sm text-slate-500 uppercase mb-2">Contract Terms</h3><div className="bg-slate-800 rounded p-4"><p className="italic">"{data.contractText}"</p><p className="italic mt-2 text-amber-400">"{data.penaltyText}"</p></div></div>
          <div><h3 className="text-sm text-slate-500 uppercase mb-2">Analysis</h3><div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded p-3"><div className="text-xs text-slate-500">Required</div><div className="text-lg font-semibold text-emerald-400">{data.requirement}</div></div>
            <div className="bg-slate-800 rounded p-3"><div className="text-xs text-slate-500">Actual</div><div className="text-lg font-semibold text-red-400">{data.actual}</div></div>
            <div className="bg-slate-800 rounded p-3"><div className="text-xs text-slate-500">Gap</div><div className="text-lg font-semibold text-amber-400">{data.gap}</div></div>
            <div className="bg-slate-800 rounded p-3"><div className="text-xs text-slate-500">Claims</div><div className="text-lg font-semibold">{data.claims.toLocaleString()}</div></div>
          </div></div>
          {data.interest > 0 && <div><h3 className="text-sm text-slate-500 uppercase mb-2">Interest</h3><div className="bg-slate-800 rounded p-4"><div className="text-3xl font-bold text-amber-400">{fmt(data.interest)}</div><div className="font-mono text-sm text-slate-400 mt-2">{fmt(data.principal)} × 12% × ({data.gap.split(' ')[0]}/365)</div></div></div>}
          <div className="flex gap-2">{data.agents.map(a => <AgentBadge key={a} name={a.replace('Agent', '')} />)}<Confidence v={data.confidence} /></div>
        </div>
        <div className="p-5 border-t border-slate-700 flex justify-end gap-3">
          <button className="px-4 py-2 bg-slate-700 rounded flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
          <button onClick={() => { close(); open('letter', data); }} className="px-6 py-2 bg-emerald-500 rounded font-semibold flex items-center gap-2"><Send className="w-4 h-4" />Generate Letter</button>
        </div>
      </div>
    </div>
  );
}

function AppealModal({ data, close }: { data: Appeal; close: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-5 border-b border-slate-700 flex justify-between">
          <div><h2 className="text-xl font-bold">Appeal - {data.id}</h2><p className="text-slate-500">{data.payer} • {data.carc}</p></div>
          <button onClick={close} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div><h3 className="text-sm text-slate-500 uppercase mb-2">Claim</h3><div className="bg-slate-800 rounded p-4 space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">DOS</span><span>{data.dos}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Amount</span><span className="font-semibold">{fmt(data.amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Days Left</span><span className={data.days < 14 ? 'text-red-400' : ''}>{data.days}</span></div>
            </div></div>
            <div><h3 className="text-sm text-slate-500 uppercase mb-2">AI Analysis</h3><div className="bg-slate-800 rounded p-4 space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Win %</span><span className="text-emerald-400 font-semibold">{pct(data.prob)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Expected Value</span><span className="text-emerald-400 font-semibold">{fmt(data.ev)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">EV Rank</span><span className="text-cyan-400">#{data.rank}</span></div>
            </div></div>
          </div>
          <div><h3 className="text-sm text-slate-500 uppercase mb-2">AI Reasoning</h3><div className="bg-purple-500/10 border border-purple-500/30 rounded p-4 flex gap-3"><Brain className="w-5 h-5 text-purple-400" /><p className="text-purple-200">{data.reason}</p></div></div>
          <div><h3 className="text-sm text-slate-500 uppercase mb-2">Generated Appeal</h3><div className="bg-slate-800 rounded p-4 text-sm">
            <p className="font-semibold mb-2">Re: Appeal for Claim {data.id}</p>
            <p>We are appealing denial (CARC {data.carc}). {data.reason}</p>
            <p className="mt-2">Please reprocess and remit {fmt(data.amount)}.</p>
          </div></div>
        </div>
        <div className="p-5 border-t border-slate-700 flex justify-end gap-3">
          <button className="px-4 py-2 bg-slate-700 rounded">Edit</button>
          <button className="px-6 py-2 bg-emerald-500 rounded font-semibold flex items-center gap-2"><Send className="w-4 h-4" />Submit Appeal</button>
        </div>
      </div>
    </div>
  );
}

// CHAT PANEL - Connected to live Azure OpenAI backend with GraphRAG
function ChatPanel({ close }: { close: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([{ t: 'ai', m: "Welcome to ContosoHealth AI. Found $25.5M recoverable. Top action: $1.24M interest demand for UHC.", a: 'Orchestrator', r: 'ContractAgent -> ValidationAgent' }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<number | null>(null);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMsgs(p => [...p, { t: 'user', m: userMsg }]);
    setInput('');
    setThinking(true);
    
    try {
      const q = userMsg.toLowerCase();
      let payerId = 'uhc';
      if (q.includes('humana')) payerId = 'humana';
      else if (q.includes('bcbs') || q.includes('blue')) payerId = 'bcbs';
      else if (q.includes('aetna')) payerId = 'aetna';
      else if (q.includes('cigna')) payerId = 'cigna';
      else if (q.includes('medicare')) payerId = 'medicare';
      
      const response = await fetch(`${API_BASE}/api/warfare/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, payer_id: payerId })
      });
      
      if (!response.ok) throw new Error('API error');
      
      const data: ChatResponse = await response.json();
      // Handle both old format (agent_used, model) and new format (agent, agents_used, models_used)
      const agent = data.agent_used || (data as any).agent || ((data as any).agents_used?.[0]) || 'Orchestrator';
      const model = data.model || ((data as any).models_used?.[0]) || 'gpt-5';
      const content = (data as any).content || '';
      
      // Check if we have structured response fields
      const hasStructured = !!(data.thinking || data.financial_impact || data.root_cause || data.contract_implication || data.recommended_actions || data.sources);
      
      setMsgs(p => [...p, { 
        t: 'ai', 
        m: content, 
        a: agent, 
        r: `${model} | Confidence: ${((data.confidence || 0.9) * 100).toFixed(0)}%`,
        data: hasStructured ? data : undefined 
      }]);
    } catch (err) {
      setMsgs(p => [...p, { t: 'ai', m: "I can help with contract violations, appeal optimization, policy predictions, and negotiation strategy. What would you like to know?", a: 'Orchestrator', r: '' }]);
    } finally {
      setThinking(false);
    }
  };

  const renderStructuredResponse = (data: ChatResponse, idx: number) => (
    <div className="space-y-3">
      {data.thinking && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg overflow-hidden">
          <button 
            onClick={() => setExpandedThinking(expandedThinking === idx ? null : idx)}
            className="w-full px-3 py-2 flex items-center justify-between text-violet-400 hover:bg-violet-500/10"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Chain of Thought</span>
            </div>
            {expandedThinking === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedThinking === idx && (
            <div className="px-3 pb-3 text-xs space-y-2">
              <div><span className="text-violet-400">Analysis:</span> <span className="text-slate-300">{data.thinking.question_analysis}</span></div>
              <div><span className="text-violet-400">Data:</span> <span className="text-slate-300">{data.thinking.relevant_data}</span></div>
              <div><span className="text-violet-400">Routing:</span> <span className="text-slate-300">{data.thinking.agent_routing}</span></div>
              <div className="text-violet-400">Steps:</div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {data.thinking.reasoning_steps.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {data.financial_impact && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Financial Impact</span>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-white font-semibold">{data.financial_impact.revenue_at_risk} at risk</div>
            <div className="text-slate-300">{data.financial_impact.ytd_impact}</div>
            <div className="text-slate-400 text-xs">{data.financial_impact.trend_or_recovery}</div>
          </div>
        </div>
      )}
      
      {data.root_cause && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Search className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Root Cause</span>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-white">{data.root_cause.primary_cause}</div>
            {data.root_cause.contributing_factors.length > 0 && (
              <ul className="text-slate-300 text-xs list-disc list-inside">
                {data.root_cause.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
            <div className="text-slate-400 text-xs mt-1">Evidence: {data.root_cause.evidence}</div>
          </div>
        </div>
      )}
      
      {data.contract_implication && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Contract Implication</span>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-white font-semibold">{data.contract_implication.section_reference}</div>
            <div className="text-slate-300">{data.contract_implication.violation_type}</div>
            <div className="text-red-300 text-xs">{data.contract_implication.legal_standing}</div>
          </div>
        </div>
      )}
      
      {data.recommended_actions && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Recommended Actions</span>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex gap-2"><span className="text-cyan-400 text-xs w-16 shrink-0">Immediate:</span><span className="text-white text-xs">{data.recommended_actions.immediate}</span></div>
            <div className="flex gap-2"><span className="text-cyan-400 text-xs w-16 shrink-0">Short-term:</span><span className="text-slate-300 text-xs">{data.recommended_actions.short_term}</span></div>
            <div className="flex gap-2"><span className="text-cyan-400 text-xs w-16 shrink-0">Strategic:</span><span className="text-slate-400 text-xs">{data.recommended_actions.strategic}</span></div>
          </div>
        </div>
      )}
      
      {data.sources && (
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Database className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Sources</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-slate-300">{data.sources.data_sources.join(' | ')}</div>
            <div className="text-slate-400">{data.sources.documents.join(' | ')}</div>
            {data.sources.knowledge_graph.length > 0 && (
              <div className="text-purple-400 text-xs mt-1">GraphRAG: {data.sources.knowledge_graph[0]}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[450px] bg-slate-900 border-l border-slate-800 flex flex-col z-50">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3"><Brain className="w-5 h-5 text-purple-400" /><div><div className="font-semibold">ContosoHealth AI</div><div className="text-xs text-slate-500">GPT-5 Multi-Agent System</div></div></div>
        <button onClick={close} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.t === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] rounded-2xl px-4 py-3 ${m.t === 'user' ? 'bg-cyan-500 rounded-br-sm' : 'bg-slate-800 rounded-bl-sm'}`}>
              {m.t === 'ai' && <div className="flex items-center gap-2 mb-2 text-xs text-purple-400"><Brain className="w-3 h-3" />{m.a} <span className="text-slate-500">| {m.r}</span></div>}
              {m.data ? renderStructuredResponse(m.data, i) : <p className="text-sm whitespace-pre-line">{m.m}</p>}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-800 rounded-lg p-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">GPT-5 processing with chain of thought...</span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} placeholder="Ask about violations, appeals..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm" />
          <button onClick={send} className="px-4 py-2 bg-cyan-500 rounded-lg"><Send className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-2 mt-2">{['UHC violations', 'Appeal queue', 'Policy alerts'].map(q => <button key={q} onClick={() => setInput(q)} className="px-3 py-1 bg-slate-800 text-xs rounded-full hover:bg-slate-700">{q}</button>)}</div>
      </div>
    </div>
  );
}
