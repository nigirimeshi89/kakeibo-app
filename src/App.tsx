/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Transaction, SavingsGoal, RecurringPayment, CategoryBudget, QuickTemplate } from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_RECURRING_PAYMENTS,
  INITIAL_QUICK_TEMPLATES
} from './constants';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SavingsGoalTracker } from './components/SavingsGoalTracker';
import { RecurringPaymentTracker } from './components/RecurringPaymentTracker';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { MoneyCalendar } from './components/MoneyCalendar';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sparkles,
  PieChart as PieIcon,
  ListOrdered,
  CreditCard,
  Target as TargetIcon,
  Calendar as CalIcon,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'money_manager_transactions_v2',
    INITIAL_TRANSACTIONS
  );
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>(
    'money_manager_goals_v2',
    INITIAL_SAVINGS_GOALS
  );
  const [recurringPayments, setRecurringPayments] = useLocalStorage<RecurringPayment[]>(
    'money_manager_recurring_v2',
    INITIAL_RECURRING_PAYMENTS
  );
  const [budgets, setBudgets] = useLocalStorage<CategoryBudget[]>(
    'money_manager_budgets_v2',
    []
  );
  const [quickTemplates, setQuickTemplates] = useLocalStorage<QuickTemplate[]>(
    'money_manager_quick_templates_v2',
    INITIAL_QUICK_TEMPLATES
  );

  // Switch between tabs/views
  const [activeSection, setActiveSection] = useState<'dashboard' | 'transactions' | 'goals' | 'recurring' | 'calendar'>('dashboard');

  // Prefilled date trigger from Calendar click
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  // Shared filtering state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Calculations for total balances
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Handles adding transaction locally
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = 'tx_' + Date.now();
    const tx: Transaction = {
      ...newTx,
      id
    };
    setTransactions([tx, ...transactions]);
  };

  // Handles deleting transaction locally
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Handles Saving Goals list locally
  const handleSetGoals = (newGoals: SavingsGoal[]) => {
    const goalsWithIds = newGoals.map((g, idx) => {
      if (!g.id) {
        return { ...g, id: `goal_${Date.now()}_${idx}` };
      }
      return g;
    });

    setGoals(goalsWithIds);
  };

  // Handles Recurring payments list locally
  const handleSetRecurringPayments = (newRecurrings: RecurringPayment[]) => {
    setRecurringPayments(newRecurrings);
  };

  // Handles category budgets locally
  const handleSetCategoryBudget = (category: string, amount: number) => {
    const existingIdx = budgets.findIndex(b => b.category === category);
    let updated: CategoryBudget[] = [];
    if (existingIdx >= 0) {
      updated = [...budgets];
      updated[existingIdx].budgetAmount = amount;
    } else {
      updated = [...budgets, { category, budgetAmount: amount }];
    }

    setBudgets(updated);
  };

  // Handles favorite template additions
  const handleAddQuickTemplate = (newTpl: Omit<QuickTemplate, 'id'>) => {
    const id = 'q_' + Date.now();
    const tpl: QuickTemplate = {
      ...newTpl,
      id
    };
    const updated = [...quickTemplates, tpl];
    setQuickTemplates(updated);
  };

  // Handles favorite template deletions
  const handleDeleteQuickTemplate = (id: string) => {
    const updated = quickTemplates.filter(t => t.id !== id);
    setQuickTemplates(updated);
  };

  // CSV Import handler to bulk-inject records locally
  const handleImportTransactions = (imported: Omit<Transaction, 'id'>[]) => {
    const newTxs: Transaction[] = [];
    for (let i = 0; i < imported.length; i++) {
      const id = 'tx_imported_' + Date.now() + '_' + i;
      const tx: Transaction = {
        ...imported[i],
        id
      };
      newTxs.push(tx);
    }
    setTransactions(prev => [...newTxs, ...prev]);
  };

  // Click handler from Analytics Category row -> Filters lists and switches screen
  const handleSelectCategoryFromChart = (category: string | null) => {
    setSelectedCategoryFilter(category);
    if (category) {
      setActiveSection('transactions'); // Auto-switch to view transactions when filtered
    }
  };

  // Reset demo defaults helper
  const handleResetData = () => {
    if (confirm('すべての登録データを初期状態（デモ用サンプルデータ）にリセットしますか？')) {
      localStorage.clear();
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_SAVINGS_GOALS);
      setRecurringPayments(INITIAL_RECURRING_PAYMENTS);
      setBudgets([]);
      setQuickTemplates(INITIAL_QUICK_TEMPLATES);
      setSelectedCategoryFilter(null);
      setActiveSection('dashboard');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pb-24 md:pb-16 font-sans antialiased text-[#3d3d3d]">
      {/* Natural Tones Top Branding Rail */}
      <header className="bg-[#f2f1e9] border-b border-[#e5e4da] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#5a5a40] flex items-center justify-center text-white shadow-sm font-bold text-lg">
              K
            </div>
            <div>
              <span className="font-serif italic font-black text-[#5a5a40] tracking-tight text-2xl">
                Kakeibo.
              </span>
              <span className="text-[10px] text-[#5a5a40] font-bold bg-[#e8e7dd] border border-[#e5e4da] px-2 py-0.5 rounded-full ml-3 hidden sm:inline-block">
                Money Manager
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Safe Local Storage Indicator */}
            <div className="flex items-center gap-1.5 bg-white/80 border border-[#e5e4da] px-3.5 py-1.5 rounded-full text-xs shadow-xs text-[#7a7a60]" title="この端末のブラウザに、データが自動的にローカル保存されています。クラウドサーバーを介さないため安心・高速です。">
              <ShieldCheck size={14} className="text-[#5a5a40]" />
              <span className="text-[10px] font-bold">ローカル自動保存中</span>
            </div>

            <button
              onClick={handleResetData}
              className="flex items-center gap-1 text-xs font-semibold text-[#7a7a60] hover:text-[#5a5a40] bg-[#e8e7dd]/60 hover:bg-[#e8e7dd] border border-[#e5e4da] px-3.5 py-2 rounded-full transition-all cursor-pointer"
              title="デモ状態にリセット"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">デモ復元</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Wrapper Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Dynamic Executive Metric Counter Row in Natural Tones design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="executive-metric-row">
          {/* Card 1: Balance (Soft white cream card with border) */}
          <div className="bg-white border border-[#f0eee0] p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-[#9a9a80] uppercase tracking-wider">
                CURRENT BALANCE
              </span>
              <span className="text-[10px] text-[#5a5a40] bg-[#f5f5f0] px-2 py-0.5 rounded-md">
                お財布の総残高
              </span>
            </div>
            <h3 className="font-serif font-semibold text-3xl text-[#3d3d3d] tracking-tight transition-colors">
              {formatCurrency(currentBalance)}
            </h3>
            <p className="text-[11px] text-[#9a9a80] flex items-center gap-1">
              <Sparkles size={11} className="text-[#a5a58d]" />
              実質お財布残高です
            </p>
          </div>

          {/* Card 2: Income (Olive Green Hero background block with white text) */}
          <div className="bg-[#5a5a40] p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 text-white relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-[#d0d0c0] uppercase tracking-wider">
                MONTHLY INCOME
              </span>
              <span className="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded-md">
                累計の収入
              </span>
            </div>
            <h3 className="font-serif font-black text-3xl tracking-tight text-white">
              {formatCurrency(totalIncome)}
            </h3>
            {/* Dynamic visual slider indicator */}
            <div className="w-full bg-[#7a7a60] h-1 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[100%]"></div>
            </div>
          </div>

          {/* Card 3: Expense (Soft white cream card with border) */}
          <div className="bg-white border border-[#f0eee0] p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-[#9a9a80] uppercase tracking-wider">
                MONTHLY EXPENSE
              </span>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                累計の支出
              </span>
            </div>
            <h3 className="font-serif font-semibold text-3xl text-[#3d3d3d] tracking-tight">
              {formatCurrency(totalExpense)}
            </h3>
            <div className="flex space-x-1">
              <span className="px-2 py-0.5 bg-[#f5f5f0] text-[#7a7a60] text-[10px] rounded">
                固定支払い・自動記録を含む
              </span>
            </div>
          </div>
        </div>

        {/* Section Segmented Tab Selectors: Styled with Natural Sand & Sage colors */}
        <div className="hidden md:flex border-b border-[#e5e4da] gap-2 overflow-x-auto scroller-none pb-0.5 mb-8" id="dashboard-navigator-tabs">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 font-sans font-bold text-xs rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSection === 'dashboard'
                ? 'border-[#5a5a40] text-[#5a5a40] bg-white shadow-sm font-extrabold'
                : 'border-transparent text-[#7a7a60] hover:text-[#5a5a40] hover:bg-[#e8e7dd]/30'
              }`}
          >
            <PieIcon size={14} />
            分析ダッシュボード
          </button>
          <button
            onClick={() => setActiveSection('transactions')}
            className={`flex items-center gap-2 px-6 py-3 font-sans font-bold text-xs rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSection === 'transactions'
                ? 'border-[#5a5a40] text-[#5a5a40] bg-white shadow-sm font-extrabold'
                : 'border-transparent text-[#7a7a60] hover:text-[#5a5a40] hover:bg-[#e8e7dd]/30'
              }`}
          >
            <ListOrdered size={14} />
            取引一覧・スピード記録
          </button>
          <button
            onClick={() => setActiveSection('calendar')}
            className={`flex items-center gap-2 px-6 py-3 font-sans font-bold text-xs rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSection === 'calendar'
                ? 'border-[#5a5a40] text-[#5a5a40] bg-white shadow-sm font-extrabold'
                : 'border-transparent text-[#7a7a60] hover:text-[#5a5a40] hover:bg-[#e8e7dd]/30'
              }`}
          >
            <CalIcon size={14} />
            収支カレンダー
          </button>
          <button
            onClick={() => setActiveSection('goals')}
            className={`flex items-center gap-2 px-6 py-3 font-sans font-bold text-xs rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSection === 'goals'
                ? 'border-[#5a5a40] text-[#5a5a40] bg-white shadow-sm font-extrabold'
                : 'border-transparent text-[#7a7a60] hover:text-[#5a5a40] hover:bg-[#e8e7dd]/30'
              }`}
          >
            <TargetIcon size={14} />
            貯金目標・貯蓄プラン ({goals.length})
          </button>
          <button
            onClick={() => setActiveSection('recurring')}
            className={`flex items-center gap-2 px-6 py-3 font-sans font-bold text-xs rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSection === 'recurring'
                ? 'border-[#5a5a40] text-[#5a5a40] bg-white shadow-sm font-extrabold'
                : 'border-transparent text-[#7a7a60] hover:text-[#5a5a40] hover:bg-[#e8e7dd]/30'
              }`}
          >
            <CreditCard size={14} />
            固定費・自動記録 ({recurringPayments.filter(p => p.isActive).length})
          </button>
        </div>

        {/* Content Panel Area */}
        <div id="main-content-panels" className="space-y-6">
          {activeSection === 'dashboard' && (
            <AnalyticsDashboard
              transactions={transactions}
              onSelectCategoryFilter={handleSelectCategoryFromChart}
              selectedCategoryFilter={selectedCategoryFilter}
              budgets={budgets}
              onSetBudget={handleSetCategoryBudget}
            />
          )}

          {activeSection === 'transactions' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <TransactionForm
                  onAddTransaction={handleAddTransaction}
                  selectedCategoryFromFilter={selectedCategoryFilter}
                  prefilledDate={prefilledDate}
                  onClearPrefilledDate={() => setPrefilledDate(null)}
                  quickTemplates={quickTemplates}
                  onAddQuickTemplate={handleAddQuickTemplate}
                  onDeleteQuickTemplate={handleDeleteQuickTemplate}
                />
              </div>
              <div className="lg:col-span-8">
                <TransactionList
                  transactions={transactions}
                  onDeleteTransaction={handleDeleteTransaction}
                  selectedCategoryFilter={selectedCategoryFilter}
                  onClearCategoryFilter={() => handleSelectCategoryFromChart(null)}
                  onImportTransactions={handleImportTransactions}
                />
              </div>
            </div>
          )}

          {activeSection === 'calendar' && (
            <MoneyCalendar
              transactions={transactions}
              onAddTransactionRequested={(dateStr) => {
                setPrefilledDate(dateStr);
                setActiveSection('transactions');
              }}
            />
          )}

          {activeSection === 'goals' && (
            <SavingsGoalTracker
              goals={goals}
              onSetGoals={handleSetGoals}
              currentBalance={currentBalance}
            />
          )}

          {activeSection === 'recurring' && (
            <RecurringPaymentTracker
              recurringPayments={recurringPayments}
              onSetRecurringPayments={handleSetRecurringPayments}
              onAddTransaction={handleAddTransaction}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar / iOS & Android Home-App Paradigm */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#f8f7f0] border-t border-[#e5e4da] flex justify-around items-center z-50 md:hidden py-3 px-3 pb-safe shadow-lg">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${activeSection === 'dashboard' ? 'text-[#5a5a40] scale-105 font-bold' : 'text-[#9a9a80]'
            }`}
        >
          <PieIcon size={18} className="stroke-[2.5]" />
          <span className="text-[9px] mt-1 font-sans font-bold">ダッシュ（分析）</span>
        </button>
        <button
          onClick={() => setActiveSection('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${activeSection === 'transactions' ? 'text-[#5a5a40] scale-105 font-bold' : 'text-[#9a9a80]'
            }`}
        >
          <ListOrdered size={18} className="stroke-[2.5]" />
          <span className="text-[9px] mt-1 font-sans font-bold">取引/記録</span>
        </button>
        <button
          onClick={() => setActiveSection('calendar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${activeSection === 'calendar' ? 'text-[#5a5a40] scale-105 font-bold' : 'text-[#9a9a80]'
            }`}
        >
          <CalIcon size={18} className="stroke-[2.5]" />
          <span className="text-[9px] mt-1 font-sans font-bold">カレンダー</span>
        </button>
        <button
          onClick={() => setActiveSection('goals')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${activeSection === 'goals' ? 'text-[#5a5a40] scale-105 font-bold' : 'text-[#9a9a80]'
            }`}
        >
          <TargetIcon size={18} className="stroke-[2.5]" />
          <span className="text-[9px] mt-1 font-sans font-bold">貯金目標</span>
        </button>
        <button
          onClick={() => setActiveSection('recurring')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${activeSection === 'recurring' ? 'text-[#5a5a40] scale-105 font-bold' : 'text-[#9a9a80]'
            }`}
        >
          <CreditCard size={18} className="stroke-[2.5]" />
          <span className="text-[9px] mt-1 font-sans font-bold">固定費</span>
        </button>
      </nav>
    </div>
  );
}
