
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  BrainCircuit, 
  History, 
  ArrowRight,
  Trash2,
  Calendar,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TimeCategory, 
  MoneyCategory, 
  TimeEntry, 
  MoneyEntry, 
  AIInsight 
} from './types';
import { 
  INITIAL_TIME_LOGS, 
  INITIAL_MONEY_LOGS, 
  TIME_COLORS, 
  MONEY_COLORS 
} from './constants';
import { getAIInsights } from './services/geminiService';

const WelcomeScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative animate-welcome space-y-8 max-w-lg">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <Zap className="w-12 h-12 text-[#10B981]" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-50 tracking-tight mb-4">Time Paisa Manager</h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Stop guessing where your week went.<br/>
            <span className="text-emerald-400">AI-powered clarity</span> for your time and money.
          </p>
        </div>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-[progress_3s_ease-in-out_forwards]"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [timeLogs, setTimeLogs] = useState<TimeEntry[]>(INITIAL_TIME_LOGS);
  const [moneyLogs, setMoneyLogs] = useState<MoneyEntry[]>(INITIAL_MONEY_LOGS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'ai'>('dashboard');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Forms
  const [timeForm, setTimeForm] = useState({ category: TimeCategory.Study, hours: 1, description: '', date: today });
  const [moneyForm, setMoneyForm] = useState({ category: MoneyCategory.Food, amount: 100, description: '', date: today });

  // Data Calculations
  const totalSpent = useMemo(() => moneyLogs.reduce((sum, entry) => sum + entry.amount, 0), [moneyLogs]);
  const totalHours = useMemo(() => timeLogs.reduce((sum, entry) => sum + entry.hours, 0), [timeLogs]);

  const timeChartData = useMemo(() => {
    const map = new Map<string, number>();
    timeLogs.forEach(l => map.set(l.category, (map.get(l.category) || 0) + l.hours));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [timeLogs]);

  const moneyChartData = useMemo(() => {
    const map = new Map<string, number>();
    moneyLogs.forEach(l => map.set(l.category, (map.get(l.category) || 0) + l.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [moneyLogs]);

  const progressData = useMemo(() => {
    const dates = Array.from(new Set([...timeLogs.map(l => l.date), ...moneyLogs.map(m => m.date)])).sort();
    return dates.map(d => ({
      date: d,
      hours: timeLogs.filter(l => l.date === d).reduce((s, c) => s + c.hours, 0),
      spent: moneyLogs.filter(m => m.date === d).reduce((s, c) => s + c.amount, 0),
    }));
  }, [timeLogs, moneyLogs]);

  // Handlers
  const handleAddTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeForm.hours <= 0) return;
    const newEntry: TimeEntry = { ...timeForm, id: Math.random().toString(36).substr(2, 9) };
    setTimeLogs([newEntry, ...timeLogs]);
    setTimeForm(prev => ({ ...prev, description: '' }));
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (moneyForm.amount <= 0) return;
    const newEntry: MoneyEntry = { ...moneyForm, id: Math.random().toString(36).substr(2, 9) };
    setMoneyLogs([newEntry, ...moneyLogs]);
    setMoneyForm(prev => ({ ...prev, description: '' }));
  };

  const runAnalysis = async () => {
    setIsLoadingAI(true);
    try {
      const insight = await getAIInsights(timeLogs, moneyLogs);
      setAiInsight(insight);
      setActiveTab('ai');
    } catch (error) {
      console.error(error);
      alert("AI Analysis failed. Check your connection or API key.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const CircularProgress = ({ score, color, label }: { score: number, color: string, label: string }) => {
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="bg-[#1E293B] p-8 rounded-[40px] border border-[#334155] shadow-sm flex flex-col items-center text-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{label}</span>
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r={radius} stroke="#0F172A" strokeWidth="12" fill="none" />
            <circle 
              cx="72" 
              cy="72" 
              r={radius} 
              stroke={color} 
              strokeWidth="12" 
              fill="none" 
              strokeDasharray={circumference} 
              strokeDashoffset={offset} 
              strokeLinecap="round" 
              style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
            />
          </svg>
          <span className="absolute text-3xl font-black text-slate-100">{score}%</span>
        </div>
      </div>
    );
  };

  const inputBaseClass = "w-full bg-[#0F172A] border border-[#334155] rounded-2xl px-5 py-3 text-sm font-semibold text-slate-100 placeholder:text-slate-600 focus:bg-[#0F172A] focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] outline-none transition-all h-14 shadow-inner block";

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      {/* Header */}
      <nav className="bg-[#1E293B]/80 backdrop-blur-md border-b border-[#334155] sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Zap className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-50">Time Paisa Manager</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master your week</p>
            </div>
          </div>
          <button 
            onClick={runAnalysis}
            className="hidden md:flex items-center gap-2 bg-[#10B981] text-[#0F172A] px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
            disabled={isLoadingAI}
          >
            {isLoadingAI ? <div className="w-5 h-5 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            AI Analysis
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-8 pb-32">
        
        {/* Tab Switcher */}
        <div className="flex bg-[#1E293B] p-1 rounded-2xl border border-[#334155] shadow-sm mb-10 max-w-sm mx-auto">
          {(['dashboard', 'logs', 'ai'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-emerald-500/10 text-[#10B981]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Expenses" value={`₹${totalSpent}`} icon={<Wallet className="text-rose-400" />} color="bg-rose-500/10" />
              <StatCard label="Time Logged" value={`${totalHours}h`} icon={<Clock className="text-blue-400" />} color="bg-blue-500/10" />
              <StatCard label="Productivity" value={aiInsight ? `${aiInsight.productivityScore}%` : '---'} icon={<TrendingUp className="text-[#10B981]" />} color="bg-emerald-500/10" />
              <StatCard label="Fin. Health" value={aiInsight ? `${aiInsight.financialScore}%` : '---'} icon={<Zap className="text-[#F59E0B]" />} color="bg-amber-500/10" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard title="Time Allocation" subtitle="Where your hours are going">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie 
                      data={timeChartData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="40%" 
                      innerRadius={60} 
                      outerRadius={85} 
                      paddingAngle={5}
                    >
                      {timeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIME_COLORS[entry.name] || '#94a3b8'} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#F8FAFC' }} 
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Expense Breakdown" subtitle="Visualizing your cash flow">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie 
                      data={moneyChartData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="40%" 
                      innerRadius={60} 
                      outerRadius={85} 
                      paddingAngle={5}
                    >
                      {moneyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MONEY_COLORS[entry.name] || '#94a3b8'} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#F8FAFC' }} 
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Weekly Trend" subtitle="Progress over the last few days" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#F8FAFC' }} 
                    />
                    <Legend verticalAlign="top" align="right" />
                    <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} name="Time (Hrs)" />
                    <Line yAxisId="right" type="monotone" dataKey="spent" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} name="Money (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Time Log Form */}
            <div className="space-y-6">
              <div className="bg-[#1E293B] p-8 rounded-[40px] border border-[#334155] shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20">
                    <Clock className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-50">Track Activity</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Log your hours</p>
                  </div>
                </div>
                <form onSubmit={handleAddTime} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        className={inputBaseClass}
                        value={timeForm.category}
                        onChange={e => setTimeForm({ ...timeForm, category: e.target.value as TimeCategory })}
                      >
                        {Object.values(TimeCategory).map(c => <option key={c} value={c} className="bg-[#1E293B]">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hours Spent</label>
                      <input 
                        type="number" step="0.5" min="0" placeholder="0.0"
                        className={inputBaseClass}
                        value={timeForm.hours}
                        onChange={e => setTimeForm({ ...timeForm, hours: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date"
                        className={inputBaseClass}
                        value={timeForm.date}
                        onChange={e => setTimeForm({ ...timeForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">What did you do?</label>
                      <input 
                        type="text" placeholder="e.g., Coding React"
                        className={inputBaseClass}
                        value={timeForm.description}
                        onChange={e => setTimeForm({ ...timeForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#10B981] hover:brightness-110 text-[#0F172A] font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <PlusCircle className="w-5 h-5" /> Add Log
                  </button>
                </form>
              </div>

              <div className="bg-[#1E293B] rounded-[40px] border border-[#334155] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#1E293B]">
                  <span className="text-sm font-bold text-slate-200">Recent Activities</span>
                  <History className="w-4 h-4 text-slate-500" />
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-[#334155]">
                  {timeLogs.length === 0 ? (
                    <div className="p-10 text-center text-slate-600 italic text-sm font-medium">No logs recorded yet.</div>
                  ) : timeLogs.map(log => (
                    <div key={log.id} className="p-4 flex items-center justify-between group hover:bg-[#0F172A]/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs" style={{ backgroundColor: TIME_COLORS[log.category] + '20', color: TIME_COLORS[log.category], border: `1px solid ${TIME_COLORS[log.category]}30` }}>
                          {log.category[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{log.description || log.category}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{log.date} • {log.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-100">{log.hours}h</span>
                        <button onClick={() => setTimeLogs(timeLogs.filter(l => l.id !== log.id))} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Money Log Form */}
            <div className="space-y-6">
              <div className="bg-[#1E293B] p-8 rounded-[40px] border border-[#334155] shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-rose-500/10 p-2.5 rounded-2xl border border-rose-500/20">
                    <Wallet className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-50">Log Spending</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Track every rupee</p>
                  </div>
                </div>
                <form onSubmit={handleAddMoney} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        className={inputBaseClass}
                        value={moneyForm.category}
                        onChange={e => setMoneyForm({ ...moneyForm, category: e.target.value as MoneyCategory })}
                      >
                        {Object.values(MoneyCategory).map(c => <option key={c} value={c} className="bg-[#1E293B]">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</label>
                      <input 
                        type="number" min="0" placeholder="0"
                        className={inputBaseClass}
                        value={moneyForm.amount}
                        onChange={e => setMoneyForm({ ...moneyForm, amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
                      <input 
                        type="date"
                        className={inputBaseClass}
                        value={moneyForm.date}
                        onChange={e => setMoneyForm({ ...moneyForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Paid To / Notes</label>
                      <input 
                        type="text" placeholder="e.g., Swiggy Meal"
                        className={inputBaseClass}
                        value={moneyForm.description}
                        onChange={e => setMoneyForm({ ...moneyForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-rose-500 hover:brightness-110 text-[#0F172A] font-bold py-4 rounded-2xl shadow-xl shadow-rose-500/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <PlusCircle className="w-5 h-5" /> Add Log
                  </button>
                </form>
              </div>

              <div className="bg-[#1E293B] rounded-[40px] border border-[#334155] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#1E293B]">
                  <span className="text-sm font-bold text-slate-200">Expense History</span>
                  <History className="w-4 h-4 text-slate-500" />
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-[#334155]">
                  {moneyLogs.length === 0 ? (
                    <div className="p-10 text-center text-slate-600 italic text-sm font-medium">No expenses recorded yet.</div>
                  ) : moneyLogs.map(log => (
                    <div key={log.id} className="p-4 flex items-center justify-between group hover:bg-[#0F172A]/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs" style={{ backgroundColor: MONEY_COLORS[log.category] + '20', color: MONEY_COLORS[log.category], border: `1px solid ${MONEY_COLORS[log.category]}30` }}>
                          {log.category[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{log.description || log.category}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{log.date} • {log.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-100">₹{log.amount}</span>
                        <button onClick={() => setMoneyLogs(moneyLogs.filter(l => l.id !== log.id))} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {!aiInsight && !isLoadingAI ? (
              <div className="bg-[#1E293B] p-12 rounded-[40px] border border-[#334155] shadow-xl text-center space-y-6">
                <div className="bg-blue-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                  <BrainCircuit className="w-12 h-12 text-[#3B82F6]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Ready for the Reality Check?</h2>
                <p className="text-slate-400 max-w-sm mx-auto font-medium">I'll look at your week and tell you the honest truth. Be prepared: I don't hold back on the reels-to-study ratio.</p>
                <button 
                  onClick={runAnalysis}
                  className="bg-[#3B82F6] hover:brightness-110 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl shadow-blue-500/10 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  Start Analysis <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : isLoadingAI ? (
              <div className="bg-[#1E293B] p-12 rounded-[40px] border border-[#334155] shadow-xl text-center space-y-8">
                 <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#10B981] rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Sparkles className="w-10 h-10 text-[#10B981] animate-pulse" />
                    </div>
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Judging your habits...</h2>
                   <p className="text-slate-500 mt-2 font-semibold italic">"Wait, you watched 4 hours of reels but forgot to drink water?"</p>
                 </div>
              </div>
            ) : aiInsight && (
              <div className="space-y-8">
                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CircularProgress score={aiInsight.productivityScore} color="#10B981" label="Focus Score" />
                  <CircularProgress score={aiInsight.financialScore} color="#F59E0B" label="Pocket Health" />
                </div>

                {/* The Roast & Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-700">
                   <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <BrainCircuit className="w-32 h-32" />
                   </div>
                   <div className="relative z-10 space-y-6">
                      <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-[#10B981] text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">The Verdict</div>
                      <h3 className="text-2xl font-black italic tracking-tight leading-snug">"{aiInsight.roast}"</h3>
                      <p className="text-slate-400 font-medium leading-relaxed">{aiInsight.summary}</p>
                   </div>
                </div>

                {/* Next Week Plan */}
                <div className="bg-[#1E293B] p-10 rounded-[40px] border border-[#334155] shadow-sm">
                   <div className="flex items-center gap-3 mb-8">
                     <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20">
                        <Calendar className="w-6 h-6 text-[#10B981]" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-50">The Next Week Blueprint</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Actionable goals</p>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {aiInsight.nextWeekPlan.map((p, i) => (
                       <div key={i} className="flex gap-4 p-5 rounded-3xl bg-[#0F172A]/50 border border-[#334155] hover:bg-emerald-500/5 transition-all group">
                         <div className="w-12 h-12 rounded-2xl bg-[#1E293B] shadow-sm border border-[#334155] flex items-center justify-center font-black text-[#10B981] flex-shrink-0 group-hover:scale-110 transition-transform">
                           {p.day.substr(0, 1)}
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">{p.day}</p>
                            <p className="text-sm font-bold text-slate-100">{p.focus}</p>
                            <p className="text-xs text-[#10B981] font-bold mt-1">Target: {p.limit}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiInsight.tips.map((tip, i) => (
                    <div key={i} className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-2 shrink-0"></div>
                      <p className="text-xs font-semibold text-slate-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Call to Action */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full px-6 flex justify-center">
        <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-[#334155] px-6 py-4 rounded-[32px] shadow-2xl flex items-center gap-6 max-w-md w-full sm:w-auto">
          <button onClick={() => setActiveTab('logs')} className="flex flex-col items-center gap-1 group">
             <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center group-hover:bg-[#1E293B] transition-colors border border-[#334155]">
               <PlusCircle className="w-5 h-5 text-slate-400" />
             </div>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Add Log</span>
          </button>
          <div className="w-[1px] h-10 bg-[#334155] shrink-0"></div>
          <button 
            onClick={runAnalysis}
            disabled={isLoadingAI}
            className="bg-[#10B981] text-[#0F172A] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 flex-1 sm:flex-none justify-center active:scale-95"
          >
            {isLoadingAI ? 'Analyzing...' : 'Review Week'}
            {!isLoadingAI && <BrainCircuit className="w-4 h-4 text-[#0F172A]" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-[#1E293B] p-6 rounded-[32px] border border-[#334155] shadow-sm flex items-center gap-5 hover:shadow-md hover:border-slate-600 transition-all group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-100">{value}</p>
    </div>
  </div>
);

const ChartCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className }) => (
  <div className={`bg-[#1E293B] p-8 rounded-[40px] border border-[#334155] shadow-sm ${className}`}>
    <div className="mb-4">
      <h3 className="text-lg font-bold text-slate-100">{title}</h3>
      <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
    </div>
    <div className="w-full flex justify-center">
      {children}
    </div>
  </div>
);

export default App;
