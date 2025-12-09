import { useState } from 'react';
import { AlertTriangle, FileText, Sparkles, Send, X, Loader2, Download, Building2, Zap, Target, Brain, Bot, Radar, Scale, Gavel, CheckCircle, Eye, ArrowUpRight, ArrowDownRight, Users, Copy, BarChart3, Heart } from 'lucide-react';

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


interface ChatMessage {
  t: 'user' | 'ai';
  m: string;
  a?: string;
  r?: string;
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

const WIN_RATES = [
  { carc: 'CO-16', desc: 'Missing info', rate: 0.78, vol: 1247, color: '#22c55e' },
  { carc: 'CO-197', desc: 'Prior auth', rate: 0.68, vol: 892, color: '#84cc16' },
  { carc: 'OA-23', desc: 'Med necessity', rate: 0.52, vol: 634, color: '#eab308' },
  { carc: 'CO-97', desc: 'Bundling', rate: 0.45, vol: 423, color: '#f97316' },
  { carc: 'CO-4', desc: 'Not covered', rate: 0.22, vol: 567, color: '#ef4444' },
  { carc: 'PR-1', desc: 'Patient resp', rate: 0.08, vol: 1124, color: '#dc2626' }
];

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
                  { id: 'violations', label: 'Violations', icon: AlertTriangle, badge: VIOLATIONS.length },
                  { id: 'appeals', label: 'Appeals', icon: Target, badge: '500' },
                  { id: 'radar', label: 'Radar', icon: Radar, badge: ALERTS.length },
                  { id: 'negotiate', label: 'Negotiate', icon: Scale }
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
          {tab === 'violations' && <ViolationsTab open={open} />}
          {tab === 'appeals' && <AppealsTab open={open} />}
          {tab === 'radar' && <RadarTab />}
          {tab === 'negotiate' && <NegotiateTab />}
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
function SummaryTab({ total, onNav, open }: { total: number; onNav: (tab: string) => void; open: (type: string, data: Violation) => void }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2"><Sparkles className="w-6 h-6 text-emerald-400" /><span className="text-sm text-emerald-400 uppercase">AI-Identified Recovery</span></div>
            <div className="flex items-baseline gap-3"><span className="text-5xl font-bold">{fmt(total)}</span><span className="text-slate-400">ready to recover</span></div>
            <div className="flex gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" />{VIOLATIONS.length} violations</span>
              <span className="flex items-center gap-2"><Target className="w-4 h-4 text-cyan-400" />500 appeals</span>
              <span className="flex items-center gap-2"><Radar className="w-4 h-4 text-purple-400" />{ALERTS.length} alerts</span>
            </div>
          </div>
          <button onClick={() => open('letter', VIOLATIONS[0])} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg flex items-center gap-2 h-fit">
            <Zap className="w-5 h-5" />Execute Top Action
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-amber-400" />Priority Actions</h2>
        <div className="space-y-3">
          {VIOLATIONS.map((v, i) => (
            <div key={v.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-cyan-500' : 'bg-slate-600'}`}>{i + 1}</div>
                <div>
                  <div className="font-semibold">{v.title} <span className="text-slate-500">• {v.payer}</span></div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-emerald-400 font-semibold">{fmt(v.principal + v.interest)}</span>
                    <Confidence v={v.confidence} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => open('violation', v)} className="px-3 py-2 bg-slate-700 rounded"><Eye className="w-4 h-4" /></button>
                <button onClick={() => open('letter', v)} className="px-4 py-2 bg-emerald-500 rounded font-medium flex items-center gap-2"><Send className="w-4 h-4" />Send</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-cyan-400" />Appeal Queue</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-900/50 rounded p-2"><div className="text-xl font-bold">500</div><div className="text-xs text-slate-500">Total</div></div>
            <div className="bg-slate-900/50 rounded p-2"><div className="text-xl font-bold text-emerald-400">$425K</div><div className="text-xs text-slate-500">Expected</div></div>
          </div>
          <button onClick={() => onNav('appeals')} className="w-full py-2 bg-slate-700 rounded text-sm">View Queue →</button>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-amber-500/30 p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Radar className="w-5 h-5 text-amber-400" />Policy Alert</h3>
          <div className="font-semibold">{ALERTS[0].title}</div>
          <div className="text-sm text-slate-400">{ALERTS[0].payer} • ~{ALERTS[0].days} days</div>
          <div className="mt-2 text-amber-400">{fmt(ALERTS[0].impact)} if unprepared</div>
          <button onClick={() => onNav('radar')} className="w-full mt-3 py-2 bg-amber-500/20 text-amber-400 rounded text-sm">Prepare →</button>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Scale className="w-5 h-5 text-purple-400" />Negotiation</h3>
          <div className="font-semibold">{NEGO.payer}</div>
          <div className="text-sm text-slate-400">Expires {NEGO.expires}</div>
          <div className="mt-2 flex justify-between">
            <div><div className="text-2xl font-bold text-emerald-400">{NEGO.leverage}/100</div><div className="text-xs text-slate-500">Leverage</div></div>
            <div><div className="text-2xl font-bold text-cyan-400">{fmt(NEGO.opportunity)}</div><div className="text-xs text-slate-500">Opportunity</div></div>
          </div>
          <button onClick={() => onNav('negotiate')} className="w-full mt-3 py-2 bg-slate-700 rounded text-sm">View Playbook →</button>
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
  const filtered = APPEALS.filter(a => (filter === 'all' || a.payer === filter) && a.ev > -200);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold">Appeal ROI Optimizer</h2>
      <div className="grid grid-cols-5 gap-4">
        {[{ l: 'Total', v: '500' }, { l: 'Value', v: '$4.2M' }, { l: 'Expected', v: '$425K', c: 'text-emerald-400' }, { l: 'Appeal', v: '373', c: 'text-cyan-400' }, { l: 'Write Off', v: '127', c: 'text-red-400' }].map((s, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-sm text-slate-500">{s.l}</div><div className={`text-2xl font-bold ${s.c || ''}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex gap-3">
        <Brain className="w-5 h-5 text-purple-400" />
        <div><strong className="text-purple-300">RL Optimizer:</strong> Top 50 have 78% win rate vs 45% FIFO. +$180K improvement.</div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <h3 className="font-semibold mb-4">Win Rates by CARC</h3>
        <div className="grid grid-cols-6 gap-3">
          {WIN_RATES.map(w => (
            <div key={w.carc} className="bg-slate-900/50 rounded p-3">
              <div className="font-mono text-sm">{w.carc}</div>
              <div className="text-xs text-slate-500">{w.desc}</div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden my-2"><div className="h-full rounded-full" style={{ width: `${w.rate*100}%`, backgroundColor: w.color }} /></div>
              <div className="text-lg font-bold" style={{ color: w.color }}>{pct(w.rate)}</div>
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

// MODALS
function LetterModal({ data, close }: { data: Violation; close: () => void }) {
  const letter = DEMAND_LETTERS[data.id];
  const [body, setBody] = useState(letter?.body || '');
  const [editing, setEditing] = useState(false);
  if (!letter) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-700">
        <div className="p-5 border-b border-slate-700 flex justify-between">
          <div><h2 className="text-xl font-bold">Demand Letter</h2><p className="text-slate-500">AI-generated • Ready to send</p></div>
          <button onClick={close} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-auto p-5">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 mb-4 flex gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <div className="text-sm text-purple-300"><strong>AI:</strong> Based on {data.section}, {data.claims.toLocaleString()} claims. Confidence: {pct(data.confidence)}</div>
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
          <div className="flex gap-3"><button className="px-4 py-2 bg-slate-700 rounded flex items-center gap-2"><Download className="w-4 h-4" />PDF</button><button className="px-4 py-2 bg-slate-700 rounded flex items-center gap-2"><Copy className="w-4 h-4" />Copy</button></div>
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded font-semibold flex items-center gap-2"><Send className="w-4 h-4" />Send Now</button>
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
const API_BASE = import.meta.env.VITE_API_URL || 'https://app-gvmsuvtn.fly.dev';

function ChatPanel({ close }: { close: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([{ t: 'ai', m: "Welcome to ContosoHealth AI. Found $25.5M recoverable. Top action: $1.24M interest demand for UHC.", a: 'Orchestrator', r: 'ContractAgent -> ValidationAgent' }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMsgs(p => [...p, { t: 'user', m: userMsg }]);
    setInput('');
    setThinking(true);
    
    try {
      // Determine payer_id from the question
      const q = userMsg.toLowerCase();
      let payerId = 'uhc'; // default
      if (q.includes('humana')) payerId = 'humana';
      else if (q.includes('bcbs') || q.includes('blue')) payerId = 'bcbs';
      else if (q.includes('aetna')) payerId = 'aetna';
      else if (q.includes('cigna')) payerId = 'cigna';
      else if (q.includes('medicare')) payerId = 'medicare';
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, payer_id: payerId })
      });
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      // Format the structured response into a readable message
      let message = '';
      if (data.financial_impact) {
        message += `**Financial Impact:** ${data.financial_impact.revenue_at_risk} at risk\n`;
        message += `YTD: ${data.financial_impact.ytd_impact}\n\n`;
      }
      if (data.root_cause) {
        message += `**Root Cause:** ${data.root_cause.primary_cause}\n\n`;
      }
      if (data.recommended_actions) {
        message += `**Actions:**\n`;
        message += `- Immediate: ${data.recommended_actions.immediate}\n`;
        message += `- Short-term: ${data.recommended_actions.short_term}\n`;
      }
      if (data.contract_implication?.section_reference) {
        message += `\n**Contract:** ${data.contract_implication.section_reference} - ${data.contract_implication.violation_type}`;
      }
      
      // Determine which agent responded based on query
      let agent = 'Orchestrator';
      let routing = 'GraphRAG -> ValidationAgent';
      if (q.includes('violation') || q.includes('contract')) { agent = 'ContractAgent'; routing = 'GraphRAG -> ContractAgent -> ValidationAgent'; }
      else if (q.includes('appeal')) { agent = 'ClaimsAgent'; routing = 'ClaimsAgent -> RL Optimizer'; }
      else if (q.includes('policy') || q.includes('prior auth')) { agent = 'PolicyAgent'; routing = 'NLP -> GraphRAG -> PolicyAgent'; }
      else if (q.includes('negotiat')) { agent = 'NegotiationAgent'; routing = 'ContractAgent -> GameTheory'; }
      
      setMsgs(p => [...p, { t: 'ai', m: message || 'Analysis complete. See structured response.', a: agent, r: routing }]);
    } catch (err) {
      // Fallback to mock response if API fails
      let resp: ChatMessage = { t: 'ai', m: '', a: 'Orchestrator', r: '' };
      const q = userMsg.toLowerCase();
      if (q.includes('uhc') || q.includes('violation')) {
        resp = { t: 'ai', m: "UHC has 2 violations:\n1. Payment: 38d vs 30d -> $1.24M interest\n2. Criteria: InterQual 2024.2 vs 2023.1 -> $2.1M\n\nBoth letters ready.", a: 'ContractAgent', r: 'GraphRAG -> Validation' };
      } else if (q.includes('appeal')) {
        resp = { t: 'ai', m: "500 appeals ranked by EV. Top 50 avg 78% win rate. Bottom 127: write off. +$180K vs FIFO.", a: 'ClaimsAgent', r: 'ClaimsAgent -> RL Optimizer' };
      } else if (q.includes('humana') || q.includes('policy')) {
        resp = { t: 'ai', m: "Humana prior auth expansion in ~30 days (82% conf). Impact: $1.5M. Prepare now.", a: 'PolicyAgent', r: 'NLP -> GraphRAG' };
      } else if (q.includes('negotiat')) {
        resp = { t: 'ai', m: "UHC expires Jun 2025. Leverage: 78/100. Open +15%, target +12%, walk +8%.", a: 'NegotiationAgent', r: 'ContractAgent -> GameTheory' };
      } else {
        resp = { t: 'ai', m: "I can help with:\n- Contract violations & demand letters\n- Appeal optimization\n- Policy predictions\n- Negotiation strategy\n\nWhat would you like?", a: 'Orchestrator', r: '' };
      }
      setMsgs(p => [...p, resp]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col z-50">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3"><Brain className="w-5 h-5 text-purple-400" /><div><div className="font-semibold">ContosoHealth AI</div><div className="text-xs text-slate-500">Multi-Agent System</div></div></div>
        <button onClick={close} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.t === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.t === 'user' ? 'bg-cyan-500 rounded-br-sm' : 'bg-slate-800 rounded-bl-sm'}`}>
              {m.t === 'ai' && <div className="flex items-center gap-2 mb-2 text-xs text-purple-400"><Brain className="w-3 h-3" />{m.a}</div>}
              <p className="text-sm whitespace-pre-line">{m.m}</p>
              {m.r && <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">{m.r}</div>}
            </div>
          </div>
        ))}
        {thinking && <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Processing...</span></div>}
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
