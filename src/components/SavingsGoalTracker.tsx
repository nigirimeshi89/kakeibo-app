/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { SavingsGoal } from '../types';
import { Target, CalendarDays, Plus, Trash2, ShieldCheck, PenSquare, Sparkles } from 'lucide-react';

interface SavingsGoalTrackerProps {
    goals: SavingsGoal[];
    onSetGoals: (goals: SavingsGoal[]) => void;
    currentBalance: number;
}

export const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({
    goals,
    onSetGoals,
    currentBalance
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');

    // Small savings deposit state
    const [depositGoalIndex, setDepositGoalIndex] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState('');

    const handleAddNewGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !targetAmount || !targetDate) return;

        const newGoal: SavingsGoal = {
            title,
            targetAmount: Number(targetAmount),
            currentAmount: currentAmount ? Number(currentAmount) : 0,
            targetDate
        };

        if (editingIndex !== null) {
            const updated = [...goals];
            updated[editingIndex] = newGoal;
            onSetGoals(updated);
            setEditingIndex(null);
        } else {
            onSetGoals([...goals, newGoal]);
        }

        // Reset forms
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate('');
        setShowAddForm(false);
    };

    const handleEdit = (index: number) => {
        const goal = goals[index];
        setTitle(goal.title);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setTargetDate(goal.targetDate);
        setEditingIndex(index);
        setShowAddForm(true);
    };

    const handleDelete = (index: number) => {
        if (confirm('この貯金目標データを削除しますか？')) {
            const updated = goals.filter((_, i) => i !== index);
            onSetGoals(updated);
        }
    };

    const handleQuickDeposit = (index: number) => {
        if (depositGoalIndex === index) {
            setDepositGoalIndex(null);
            setDepositAmount('');
        } else {
            setDepositGoalIndex(index);
            setDepositAmount('');
        }
    };

    const executeDeposit = (e: React.FormEvent, index: number) => {
        e.preventDefault();
        const amount = Number(depositAmount);
        if (!amount || amount <= 0) return;

        // Update the deposit toward target goals
        const updated = [...goals];
        updated[index].currentAmount = Math.max(0, updated[index].currentAmount + amount);
        onSetGoals(updated);

        setDepositGoalIndex(null);
        setDepositAmount('');
    };

    // Remaining days calculations
    const getRemainingDays = (targetDateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(targetDateStr);
        target.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Progress Motivational comment generator
    const getMotivationalText = (percentage: number) => {
        if (percentage >= 100) {
            return { text: 'おめでとうございます！目標を完全に達成しました！大成功です！🎉', color: 'text-[#5a5a40] bg-[#faf9f2] border-[#e5e4da]' };
        }
        if (percentage >= 80) {
            return { text: '目標達成まであと一息です！素晴らしいペースでお金が貯まっています。✨', color: 'text-[#5a5a40] bg-[#faf9f2] border-[#e5e4da]' };
        }
        if (percentage >= 50) {
            return { text: '半分まで貯まりました！地道な一歩一歩が大きな成果に繋がっています。🌿', color: 'text-[#7a7a60] bg-[#faf9f2]/70 border-[#e5e4da]/70' };
        }
        if (percentage >= 20) {
            return { text: '第一ステップをクリア！この調子で少しずつ目標に近づいていきましょう。☘️', color: 'text-[#7a7a60] bg-[#faf9f2]/70 border-[#e5e4da]/70' };
        }
        return { text: '目標を設定したことが偉大な一歩です。ここからゆったりスタートしましょう！☕', color: 'text-[#9a9a80] bg-[#faf9f2]/50 border-[#e5e4da]/50' };
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            {/* Target goals header card */}
            <div className="bg-white p-6 rounded-3xl border border-[#f0eee0] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="font-serif font-black text-[#5a5a40] text-xl flex items-center gap-2.5">
                        <Target className="text-[#a5a58d]" size={22} />
                        未来の貯蓄目標 ライフプラン
                    </h2>
                    <p className="text-xs text-[#7a7a60] mt-1">夢の購入設定、旅行、将来の蓄えを具体化して貯金モチベーションを高めます。</p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => {
                            setEditingIndex(null);
                            setShowAddForm(true);
                        }}
                        id="add-goal-btn"
                        className="flex items-center gap-1.5 bg-[#5a5a40] text-white font-sans text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#7a7a60] transition-all cursor-pointer"
                    >
                        <Plus size={14} className="stroke-[3]" />
                        新しい目標を設定
                    </button>
                )}
            </div>

            {/* Interactive Goal Form */}
            {showAddForm && (
                <form
                    onSubmit={handleAddNewGoal}
                    id="savings-goal-form"
                    className="bg-[#f2f1e9]/50 border border-[#e5e4da] p-6 rounded-3xl space-y-4"
                >
                    <div className="flex items-center justify-between border-b border-[#e5e4da] pb-3">
                        <h3 className="font-serif font-bold text-[#5a5a40] text-sm md:text-base">
                            {editingIndex !== null ? '目標の再設定・編集' : '新しい貯金目標の作成'}
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingIndex(null);
                                setTitle('');
                                setTargetAmount('');
                                setCurrentAmount('');
                                setTargetDate('');
                            }}
                            className="text-xs text-[#7a7a60] font-sans hover:text-[#5a5a40] underline"
                        >
                            キャンセル
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5 font-sans">
                                目標の名前 / 目的
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="例: パソコン買い替え、ハワイに旅行"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5 font-sans">
                                目標期日 (ターゲット期限)
                            </label>
                            <input
                                type="date"
                                required
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-sm text-[#3d3d3d]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5 font-sans">
                                目標金額
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="例: 300000"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    className="w-full bg-white border border-[#e5e4da] pl-8 pr-12 py-2.5 rounded-xl text-base md:text-sm"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a80] text-xs font-bold">¥</span>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a80] text-xs font-bold">円</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5 font-sans">
                                現在の貯蓄額 (任意)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="既に貯まっている額"
                                    value={currentAmount}
                                    onChange={(e) => setCurrentAmount(e.target.value)}
                                    className="w-full bg-white border border-[#e5e4da] pl-8 pr-12 py-2.5 rounded-xl text-base md:text-sm"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a80] text-xs font-bold">¥</span>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a80] text-xs font-bold">円</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="submit"
                            className="bg-[#5a5a40] text-white font-sans text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#7a7a60] transition-all cursor-pointer"
                        >
                            {editingIndex !== null ? '変更を保存する' : '貯金目標を追加'}
                        </button>
                    </div>
                </form>
            )}

            {/* List of active targets */}
            {goals.length === 0 ? (
                <div id="no-goals-message" className="bg-white border border-[#f0eee0] p-12 text-center rounded-3xl shadow-sm">
                    <div className="w-12 h-12 bg-[#faf9f2] rounded-full flex items-center justify-center mx-auto text-[#5a5a40] mb-3">
                        <Target size={24} />
                    </div>
                    <p className="text-sm font-semibold text-[#5a5a40] font-serif">設定された貯金目標はまだありません</p>
                    <p className="text-xs text-[#9a9a80] mt-1.5 max-w-sm mx-auto">
                        貯金の具体的な目的を決めることで着実にお金を貯められます。上のボタンから追加してみましょう。
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="savings-goals-list">
                    {goals.map((goal, idx) => {
                        const percentage = Math.min(
                            100,
                            goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
                        );
                        const remainingDays = getRemainingDays(goal.targetDate);
                        const motivate = getMotivationalText(percentage);

                        return (
                            <div
                                key={idx}
                                id={`savings-goal-card-${idx}`}
                                className="bg-white border border-[#f0eee0] p-6 rounded-3xl shadow-sm flex flex-col justify-between"
                            >
                                <div>
                                    {/* Goal top bar */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#f2f1e9] text-[#7a7a60] font-sans">
                                                SAVINGS PROJECT
                                            </span>
                                            <h3 className="font-serif font-bold text-[#3d3d3d] text-base mt-2">{goal.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(idx)}
                                                className="p-1.5 text-[#9a9a80] hover:text-[#5a5a40] rounded-lg hover:bg-[#fdfcf8] transition-colors"
                                                title="目標を編集"
                                            >
                                                <PenSquare size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(idx)}
                                                className="p-1.5 text-[#9a9a80] hover:text-rose-600 rounded-lg hover:bg-[#fdfcf8] transition-colors"
                                                title="目標を削除"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date details */}
                                    <div className="flex items-center gap-1.5 text-xs text-[#9a9a80] font-sans mt-3">
                                        <CalendarDays size={14} />
                                        <span>目標期日: {goal.targetDate.replace(/-/g, '/')}</span>
                                        <span className="mx-1">•</span>
                                        {remainingDays > 0 ? (
                                            <span className="text-[#5a5a40] font-semibold bg-[#f2f1e9] px-2.5 py-0.5 rounded-full text-[10px]">
                                                あと {remainingDays} 日
                                            </span>
                                        ) : remainingDays === 0 ? (
                                            <span className="text-[#a38570] font-bold bg-[#faf9f2] border border-[#e5e4da] px-2.5 py-0.5 rounded-full text-[10px]">
                                                今日が期日です！
                                            </span>
                                        ) : (
                                            <span className="text-rose-600 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full text-[10px]">
                                                期日を経過 ({Math.abs(remainingDays)}日超過)
                                            </span>
                                        )}
                                    </div>

                                    {/* Big visual progress */}
                                    <div className="mt-6 space-y-2.5">
                                        <div className="flex justify-between items-baseline text-xs font-sans text-[#7a7a60]">
                                            <div>
                                                現在: <span className="text-[#3d3d3d] font-serif font-extrabold text-base">{formatCurrency(goal.currentAmount)}</span>
                                            </div>
                                            <div className="text-[#9a9a80] text-right">
                                                目標: <span className="font-semibold text-[#7a7a60] font-serif">{formatCurrency(goal.targetAmount)}</span>
                                            </div>
                                        </div>
                                        {/* Visual bar container */}
                                        <div className="relative w-full h-3 bg-[#f0eee0] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#a5a58d] to-[#5a5a40] transition-all duration-700 relative"
                                                style={{ width: `${percentage}%` }}
                                            >
                                                {percentage > 10 && (
                                                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-sans font-semibold text-[#9a9a80]">
                                            <span>貯金割合</span>
                                            <span className="text-[#5a5a40] font-serif font-extrabold text-sm">{percentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivational feedback alert & Quick Deposit */}
                                <div className="mt-5 space-y-3 pt-4 border-t border-[#f5f5f0]">
                                    <div className={`p-3 rounded-2xl border text-[11px] leading-relaxed font-sans ${motivate.color}`}>
                                        {motivate.text}
                                    </div>

                                    {/* Rapid deposit input panel */}
                                    {depositGoalIndex === idx ? (
                                        <form onSubmit={(e) => executeDeposit(e, idx)} className="flex items-center gap-2 mt-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="積み立て額"
                                                    value={depositAmount}
                                                    onChange={(e) => setDepositAmount(e.target.value)}
                                                    className="w-full bg-white border border-[#e5e4da] pl-6 pr-3 py-1.5 rounded-xl text-base md:text-xs"
                                                />
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a9a80] text-[10px] font-bold">¥</span>
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-[#5a5a40] text-white font-sans text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#7a7a60] transition-all cursor-pointer"
                                            >
                                                入金
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDepositGoalIndex(null)}
                                                className="text-xs text-[#9a9a80] hover:text-[#5a5a40] px-1 py-1"
                                            >
                                                閉じる
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-sans text-[#9a9a80]">
                                                ※ 目標固有の積み立てを行えます。
                                            </p>
                                            <button
                                                onClick={() => handleQuickDeposit(idx)}
                                                className="flex items-center gap-1.5 text-xs font-sans font-bold text-[#5a5a40] bg-[#e8e7dd]/60 hover:bg-[#e8e7dd] px-4.5 py-2 rounded-full transition-all"
                                            >
                                                <Plus size={12} className="stroke-[2.5]" />
                                                貯金を加算
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavingsGoalTracker;
