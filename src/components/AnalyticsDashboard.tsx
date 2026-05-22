/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import type { Transaction, CategoryBudget } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLOR_MAP } from '../constants';
import { TrendingDown, TrendingUp, PieChart as PieIcon, BarChart2, Filter, Settings, Edit2, Check, AlertCircle, Award } from 'lucide-react';

interface AnalyticsDashboardProps {
    transactions: Transaction[];
    onSelectCategoryFilter: (category: string | null) => void;
    selectedCategoryFilter: string | null;
    budgets: CategoryBudget[];
    onSetBudget: (category: string, amount: number) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    transactions,
    onSelectCategoryFilter,
    selectedCategoryFilter,
    budgets,
    onSetBudget
}) => {
    const [activeTab, setActiveTab] = useState<'category' | 'trend' | 'budget'>('category');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingAmount, setEditingAmount] = useState<string>('');

    // Calculate stats
    const stats = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });

        const balance = totalIncome - totalExpense;
        const savingRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

        return { totalIncome, totalExpense, balance, savingRate };
    }, [transactions]);

    // expense calculations by category
    const expenseByCategoryData = useMemo(() => {
        const categoriesMap: Record<string, number> = {};

        // Initialize standard categories so they exist
        EXPENSE_CATEGORIES.forEach(cat => {
            categoriesMap[cat.name] = 0;
        });

        let totalExpenseCounted = 0;
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const catName = t.category || 'その他支出';
                categoriesMap[catName] = (categoriesMap[catName] || 0) + t.amount;
                totalExpenseCounted += t.amount;
            }
        });

        const list = Object.entries(categoriesMap)
            .map(([name, amount]) => ({
                name,
                amount,
                color: CATEGORY_COLOR_MAP[name] || '#9CA3AF',
                percentage: totalExpenseCounted > 0 ? Math.round((amount / totalExpenseCounted) * 100) : 0
            }))
            .filter(item => item.amount > 0)
            .sort((a, b) => b.amount - a.amount);

        return { list, total: totalExpenseCounted };
    }, [transactions]);

    // Monthly trend calculations (past 6 months)
    const monthlyTrendData = useMemo(() => {
        const monthlyMap: Record<string, { income: number; expense: number }> = {};

        // Create chronological order helper
        transactions.forEach(t => {
            if (!t.date) return;
            const monthStr = t.date.substring(0, 7); // "YYYY-MM"
            if (!monthlyMap[monthStr]) {
                monthlyMap[monthStr] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                monthlyMap[monthStr].income += t.amount;
            } else {
                monthlyMap[monthStr].expense += t.amount;
            }
        });

        // Format keys and sort chronologically
        return Object.entries(monthlyMap)
            .map(([month, data]) => ({
                month: month.replace('-', '/'), // "YYYY/MM"
                '収入': data.income,
                '支出': data.expense,
                '収支': data.income - data.expense
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6); // Limit to last 6 months
    }, [transactions]);

    // Budget management logic
    const budgetData = useMemo(() => {
        return EXPENSE_CATEGORIES.map(cat => {
            const spent = transactions
                .filter(t => t.type === 'expense' && t.category === cat.name)
                .reduce((sum, t) => sum + t.amount, 0);
            const budgetObj = budgets.find(b => b.category === cat.name);
            const budgetLimit = budgetObj ? budgetObj.budgetAmount : 0;
            const percentage = budgetLimit > 0 ? Math.round((spent / budgetLimit) * 100) : 0;
            return {
                categoryName: cat.name,
                color: cat.color,
                spent,
                budgetLimit,
                percentage
            };
        });
    }, [transactions, budgets]);

    // Total Budgets & Remainder calculates (Requested Feature 2)
    const totalBudgets = useMemo(() => {
        const totalLimit = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
        // Focus on 2026-05 as the active month
        const totalSpent = transactions
            .filter(t => t.type === 'expense' && t.date && t.date.substring(0, 7) === '2026-05')
            .reduce((sum, t) => sum + t.amount, 0);

        const remaining = totalLimit - totalSpent;
        const percentage = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

        return {
            totalLimit,
            totalSpent,
            remaining,
            percentage
        };
    }, [transactions, budgets]);

    // Month-over-Month comparison logic (Requested Feature 3)
    const monthlyComparison = useMemo(() => {
        const todayDay = 22; // Standard simulation clock is May 22, 2026

        let thisMonthExpense = 0;
        let prevMonthExpenseTotal = 0;
        let prevMonthExpenseSamePeriod = 0;

        transactions.forEach(t => {
            if (t.type !== 'expense' || !t.date) return;
            const tDate = new Date(t.date);
            if (Number.isNaN(tDate.getTime())) return;

            const year = tDate.getFullYear();
            const month = tDate.getMonth() + 1; // 1-12
            const day = tDate.getDate();

            if (year === 2026) {
                if (month === 5) {
                    thisMonthExpense += t.amount;
                } else if (month === 4) {
                    prevMonthExpenseTotal += t.amount;
                    if (day <= todayDay) {
                        prevMonthExpenseSamePeriod += t.amount;
                    }
                }
            }
        });

        const difference = prevMonthExpenseSamePeriod - thisMonthExpense;
        const savingPercentage = prevMonthExpenseSamePeriod > 0
            ? Math.round((difference / prevMonthExpenseSamePeriod) * 100)
            : 0;

        return {
            thisMonthExpense,
            prevMonthExpenseSamePeriod,
            prevMonthExpenseTotal,
            savingPercentage,
            savingAmount: difference
        };
    }, [transactions]);

    const handleSaveBudget = (categoryName: string) => {
        const amt = parseFloat(editingAmount) || 0;
        onSetBudget(categoryName, amt);
        setEditingCategory(null);
        setEditingAmount('');
    };

    const handleStartEditBudget = (categoryName: string, currentLimit: number) => {
        setEditingCategory(categoryName);
        setEditingAmount(currentLimit > 0 ? String(currentLimit) : '');
    };

    // Custom tooltips
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value);
    };

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#faf9f2]/95 backdrop-blur-md px-3 py-2 border border-[#e5e4da] rounded-2xl shadow-md font-sans">
                    <p className="font-semibold text-[#3d3d3d] text-sm">{data.name}</p>
                    <p className="text-[#a38570] font-medium text-xs mt-0.5">
                        {formatCurrency(data.amount)} ({data.percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#faf9f2]/95 backdrop-blur-md px-4 py-2 border border-[#e5e4da] rounded-2xl shadow-md font-sans text-xs">
                    <p className="font-bold text-[#3d3d3d] mb-1.5">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex justify-between gap-4 py-0.5">
                            <span className="text-[#7a7a60] flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}:
                            </span>
                            <span className={`font-semibold ${entry.name === '収入' ? 'text-[#5a5a40]' : 'text-[#a38570]'}`}>
                                {formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Visual Analytics Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#f2f1e9]/60 p-5 rounded-3xl border border-[#e5e4da] shadow-sm">
                <div>
                    <h2 className="font-serif font-black text-[#5a5a40] text-xl">支払いの分析 & カレンダー</h2>
                    <p className="text-xs text-[#7a7a60] mt-0.5">資産の状況をお洒落に可視化し、スマートにお金を管理しましょう。</p>
                </div>
                <div className="flex bg-[#e8e7dd]/60 p-1.5 rounded-2xl w-fit border border-[#e5e4da]">
                    <button
                        onClick={() => setActiveTab('category')}
                        className={`flex items-center gap-1.5 px-5 font-sans py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'category'
                                ? 'bg-white text-[#5a5a40] shadow-sm'
                                : 'text-[#7a7a60] hover:text-[#5a5a40]'
                            }`}
                    >
                        <PieIcon size={14} />
                        カテゴリ別支出
                    </button>
                    <button
                        onClick={() => setActiveTab('trend')}
                        className={`flex items-center gap-1.5 px-5 font-sans py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'trend'
                                ? 'bg-white text-[#5a5a40] shadow-sm'
                                : 'text-[#7a7a60] hover:text-[#5a5a40]'
                            }`}
                    >
                        <BarChart2 size={14} />
                        収支トレンド
                    </button>
                    <button
                        onClick={() => setActiveTab('budget')}
                        className={`flex items-center gap-1.5 px-5 font-sans py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'budget'
                                ? 'bg-white text-[#5a5a40] shadow-sm'
                                : 'text-[#7a7a60] hover:text-[#5a5a40]'
                            }`}
                    >
                        <Settings size={14} />
                        予算管理
                    </button>
                </div>
            </div>

            {/* 1. 予算残高メーター & 2. 前月比ミニ分析レポート (Requested Features 2 & 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Budget Remainder Gauge */}
                <div className="bg-white border border-[#f0eee0] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3.5">
                            <span className="text-[10px] font-bold text-[#a38570] font-sans tracking-wide uppercase">MONTHLY BUDGET STATUS</span>
                            <span className="text-[10px] font-sans font-medium text-[#9a9a80]">5月度 リアルタイム残高メーター</span>
                        </div>

                        {totalBudgets.totalLimit === 0 ? (
                            <div className="py-2">
                                <h4 className="font-serif font-black text-sm text-[#3d3d3d] mb-1">今月の全体予算を設定しましょう</h4>
                                <p className="text-[10px] text-[#9a9a80] leading-relaxed">支出カテゴリごとに予算を決めるだけで、「あと何円おサイフに残っているか」がここにグラフィカルなメーターで表されます。</p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('budget')}
                                    className="mt-3.5 text-[10px] font-sans font-bold text-[#5a5a40] hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-0 outline-none p-0"
                                >
                                    予算設定を開始する →
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                <div>
                                    <span className="text-[10px] text-[#9a9a80] font-sans">おサイフの残高 (今月あと使える額)</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="font-serif font-black text-2xl text-[#5a5a40]">
                                            ¥{new Intl.NumberFormat('ja-JP').format(totalBudgets.remaining)}
                                        </span>
                                        <span className="text-xs text-[#5a5a40] font-bold">円</span>
                                    </div>
                                </div>

                                {/* Graphical progress bar */}
                                <div className="space-y-1.5">
                                    <div className="w-full h-3 bg-[#f2f1e9] rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${totalBudgets.remaining < 0 ? 'bg-red-500' :
                                                    totalBudgets.percentage >= 80 ? 'bg-amber-500' : 'bg-[#5a5a40]'
                                                }`}
                                            style={{ width: `${totalBudgets.remaining < 0 ? 100 : totalBudgets.percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-[#9a9a80] font-sans">
                                        <span>総予算額: ¥{new Intl.NumberFormat('ja-JP').format(totalBudgets.totalLimit)}</span>
                                        <span className={totalBudgets.remaining < 0 ? "text-red-500 font-bold animate-pulse" : "font-semibold text-[#5a5a40]"}>
                                            {totalBudgets.remaining < 0
                                                ? `予算オーバー! (超過 ¥${new Intl.NumberFormat('ja-JP').format(Math.abs(totalBudgets.remaining))})`
                                                : `残り残高率: ${100 - totalBudgets.percentage}%`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Month-over-Month MoM Mini Analytics Report card */}
                <div className="bg-[#faf9f2] border border-[#f0eee0] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-[#5a5a40] font-sans tracking-wide uppercase">MoM ANALYTICS REPORT</span>
                            <span className="text-[10px] bg-[#5a5a40]/10 text-[#5a5a40] font-bold px-2.5 py-0.5 rounded-full font-sans">
                                前月比のミニ分析
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-white text-[#5a5a40] flex items-center justify-center border border-[#e5e4da] shadow-sm flex-shrink-0">
                                    {monthlyComparison.savingAmount >= 0 ? (
                                        <Award size={16} className="text-[#5a5a40]" />
                                    ) : (
                                        <AlertCircle size={16} className="text-amber-600" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-serif font-black text-xs text-[#3d3d3d]">
                                        {monthlyComparison.savingAmount >= 0 ? "先月より節約できています！" : "支出ペースが少し早めです"}
                                    </h4>
                                    <p className="text-[9px] text-[#9a9a80] font-sans">
                                        先月の同じ時期 (2026年4月) との比較
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/60 p-3 rounded-2xl border border-[#e5e4da]/60 text-[10px] leading-relaxed text-[#5a5a40] font-sans">
                                {monthlyComparison.savingAmount >= 0 ? (
                                    <p className="font-bold text-[#3d3d3d]">
                                        🎉 先月の同じ時期に比べて <span className="text-[#5a5a40] font-black text-xs">{monthlyComparison.savingPercentage}% (約 ¥{new Intl.NumberFormat('ja-JP').format(monthlyComparison.savingAmount)}) 節約</span> できています！
                                        モチベーションを維持して、新生活やハワイ旅行プランなど楽しい貯蓄目標にまた一歩近づきましょう！
                                    </p>
                                ) : (
                                    <p className="text-[#a38570]">
                                        ⚠️ 先月の同じ時期に比べ、今月は <span className="font-black text-xs">¥{new Intl.NumberFormat('ja-JP').format(Math.abs(monthlyComparison.savingAmount))} 多く</span> 支出しています。
                                        大丈夫です！「食費」や「趣味」の項目でお気に入りクイック入力を使い、出費をスマートに振り返るだけで軌道修正できます🌱
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'budget' ? (
                <div className="bg-white border border-[#f0eee0] rounded-3xl p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <div className="p-2 bg-[#f2f1e9] text-[#5a5a40] rounded-xl">
                            <Settings size={18} />
                        </div>
                        <div>
                            <h3 className="font-serif font-black text-base text-[#3d3d3d]">カテゴリー別予算管理 (月間)</h3>
                            <p className="text-[10px] text-[#9a9a80]">各支出項目に月々の予算枠を設定し、使い過ぎを未然に防ぎます。</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="budget-manager-grid">
                        {budgetData.map((item) => {
                            const spent = item.spent;
                            const limit = item.budgetLimit;
                            const isOver = limit > 0 && spent > limit;
                            const isClose = limit > 0 && !isOver && (spent / limit) >= 0.8;
                            const isEditing = editingCategory === item.categoryName;

                            return (
                                <div
                                    key={item.categoryName}
                                    className="bg-[#fbfbfa] border border-[#f0eee0] rounded-2xl p-4 flex flex-col justify-between hover:border-[#e5e4da] transition-all"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-sm font-bold text-[#3d3d3d] font-sans">{item.categoryName}</span>
                                            </div>

                                            {limit > 0 && (
                                                <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border ${isOver ? 'bg-red-50 text-red-500 border-red-200' :
                                                        isClose ? 'bg-amber-50 text-amber-500 border-amber-200' :
                                                            'bg-green-50 text-green-600 border-green-200'
                                                    }`}>
                                                    {isOver ? '予算超過' : isClose ? '警告 (8割超)' : '良好'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 mb-3 font-sans">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[10px] text-[#9a9a80]">今月の実際の支出:</span>
                                                <span className="font-serif font-black text-sm text-[#3d3d3d]">{formatCurrency(spent)}</span>
                                            </div>

                                            <div className="flex justify-between items-center min-h-[32px]">
                                                <span className="text-[10px] text-[#9a9a80]">設定中の予算:</span>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-1 animate-fade-in">
                                                        <input
                                                            type="number"
                                                            value={editingAmount}
                                                            onChange={(e) => setEditingAmount(e.target.value)}
                                                            placeholder="金額"
                                                            className="w-24 text-right border border-[#e5e4da] rounded-lg px-2 py-1 text-xs font-sans text-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#5a5a40]"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveBudget(item.categoryName)}
                                                            className="p-1 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-md cursor-pointer transition-colors"
                                                            title="保存"
                                                        >
                                                            <Check size={12} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-serif font-bold text-xs text-[#5a5a40]">
                                                            {limit > 0 ? formatCurrency(limit) : '未設定'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleStartEditBudget(item.categoryName, limit)}
                                                            className="p-1 hover:bg-[#f2f1e9] text-[#7a7a60] hover:text-[#5a5a40] rounded-md cursor-pointer transition-colors"
                                                            title="予算を設定・修正"
                                                        >
                                                            <Edit2 size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {limit > 0 && (
                                        <div className="space-y-1.5 mt-2 pt-2.5 border-t border-[#f2f1e9] font-sans">
                                            <div className="w-full h-1.5 bg-[#f2f1e9] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : isClose ? 'bg-amber-500' : 'bg-[#5a5a40]'
                                                        }`}
                                                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-[#9a9a80]">
                                                <span>進捗率 {item.percentage}%</span>
                                                <span className={isOver ? 'text-red-500 font-bold' : ''}>
                                                    {isOver
                                                        ? `超過: ${formatCurrency(spent - limit)}`
                                                        : `残り: ${formatCurrency(limit - spent)}`}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* The Graphic Card */}
                    <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#f0eee0] shadow-sm flex flex-col justify-between min-h-[360px]">
                        <div>
                            <span className="text-xs font-bold text-[#9a9a80] font-sans tracking-wide uppercase">VISUAL DIAGRAM</span>
                            <h3 className="font-serif font-semibold text-[#3d3d3d] text-lg mt-1 mb-4">
                                {activeTab === 'category' ? 'カテゴリ別支出の割合' : '月別収支の推移（最大6ヶ月）'}
                            </h3>
                        </div>

                        <div className="flex-1 min-h-[240px] flex items-center justify-center">
                            {activeTab === 'category' ? (
                                expenseByCategoryData.list.length === 0 ? (
                                    <div className="text-center p-8">
                                        <div className="w-12 h-12 bg-[#faf9f2] rounded-full flex items-center justify-center mx-auto text-[#9a9a80] mb-2">
                                            <PieIcon size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-[#7a7a60]">支出のデータがありません</p>
                                        <p className="text-xs text-[#9a9a80] mt-1">支出を追加するとグラフに割合が表示されます。</p>
                                    </div>
                                ) : (
                                    <div className="w-full h-full relative" id="expense-pie-chart">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie
                                                    data={expenseByCategoryData.list}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={85}
                                                    paddingAngle={3}
                                                    dataKey="amount"
                                                >
                                                    {expenseByCategoryData.list.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomPieTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center metrics overlay */}
                                        <div className="absolute inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                            <span className="text-xs text-[#9a9a80] font-sans font-medium">合計支出</span>
                                            <p className="text-md sm:text-lg font-serif font-bold text-[#3d3d3d] tracking-tight mt-0.5">
                                                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(expenseByCategoryData.total)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                // Trend bar chart in Natural Tones
                                monthlyTrendData.length === 0 ? (
                                    <div className="text-center p-8">
                                        <div className="w-12 h-12 bg-[#faf9f2] rounded-full flex items-center justify-center mx-auto text-[#9a9a80] mb-2">
                                            <BarChart2 size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-[#7a7a60]">推移データが足りません</p>
                                        <p className="text-xs text-[#9a9a80] mt-1">異なる月日の収支を記録するとグラフが表示されます。</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eee0" />
                                            <XAxis dataKey="month" stroke="#9a9a80" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#9a9a80" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} dx={-5} />
                                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(240, 238, 224, 0.4)' }} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                                            <Bar dataKey="収入" fill="#5a5a40" radius={[4, 4, 0, 0]} barSize={16} />
                                            <Bar dataKey="支出" fill="#a38570" radius={[4, 4, 0, 0]} barSize={16} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            )}
                        </div>
                    </div>

                    {/* Categories Analysis & Interactive Filtering List */}
                    <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#f0eee0] shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="text-xs font-bold text-[#9a9a80] font-sans tracking-wide uppercase">CATEGORY BREAKDOWN</span>
                                    <h3 className="font-serif font-semibold text-[#3d3d3d] text-lg mt-1">カテゴリ別の支出額 と 比率</h3>
                                </div>
                                {selectedCategoryFilter && (
                                    <button
                                        onClick={() => onSelectCategoryFilter(null)}
                                        className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#5a5a40] bg-[#e8e7dd]/60 px-3 py-1.5 rounded-full border border-[#e5e4da] hover:bg-[#e8e7dd]/90 transition-all cursor-pointer"
                                    >
                                        <Filter size={11} />
                                        フィルター解除
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-[#9a9a80] mb-4 font-sans">
                                ※ カテゴリをクリックすると、スピード記録や履歴がそのカテゴリに絞り込まれます。
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                            {expenseByCategoryData.list.length === 0 ? (
                                <p className="text-xs text-center py-10 text-[#9a9a80] font-sans">
                                    記録されたカテゴリ別の支出はありません。
                                </p>
                            ) : (
                                expenseByCategoryData.list.map((item) => {
                                    const isSelected = selectedCategoryFilter === item.name;
                                    return (
                                        <div
                                            key={item.name}
                                            id={`analysis-category-${item.name}`}
                                            onClick={() => onSelectCategoryFilter(isSelected ? null : item.name)}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${isSelected
                                                    ? 'border-[#5a5a40] bg-[#faf9f2] shadow-sm'
                                                    : 'border-[#f5f5f0] hover:bg-[#faf9f2]/60 hover:border-[#e5e4da]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    ></span>
                                                    <span className="text-sm font-bold text-[#3d3d3d] font-sans">{item.name}</span>
                                                    {isSelected && (
                                                        <span className="text-[9px] bg-[#5a5a40] text-white font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">
                                                            選択中
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-[#3d3d3d] font-serif">
                                                        {formatCurrency(item.amount)}
                                                    </span>
                                                    <span className="text-[10px] text-[#9a9a80] font-normal font-sans ml-1.5">
                                                        ({item.percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Tiny gauge */}
                                            <div className="w-full h-1.5 bg-[#f0eee0] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        backgroundColor: item.color,
                                                        width: `${item.percentage}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Savings Ratio Indicator */}
                        <div className="mt-4 pt-4 border-t border-[#f0eee0] flex items-center justify-between text-xs font-sans text-[#7a7a60]">
                            <span className="flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-[#5a5a40]" />
                                今期の貯蓄率 (残高 ÷ 収入)
                            </span>
                            <span className={`font-bold font-serif text-sm ${stats.savingRate > 0 ? 'text-[#5a5a40]' : 'text-[#7a7a60]'}`}>
                                {stats.savingRate > 0 ? `+${stats.savingRate}%` : `${stats.savingRate}%`}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
