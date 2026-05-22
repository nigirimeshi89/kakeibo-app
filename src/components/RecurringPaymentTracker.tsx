/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { RecurringPayment, Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Calendar, CreditCard, Plus, Trash2, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

interface RecurringPaymentTrackerProps {
    recurringPayments: RecurringPayment[];
    onSetRecurringPayments: (payments: RecurringPayment[]) => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const RecurringPaymentTracker: React.FC<RecurringPaymentTrackerProps> = ({
    recurringPayments,
    onSetRecurringPayments,
    onAddTransaction
}) => {
    const [showAddForm, setShowAddForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('その他支出');
    const [billingDay, setBillingDay] = useState('25');

    const currentYearMonth = '2026-05'; // Guided local time calendar is default May 2026

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !billingDay) return;

        const newPayment: RecurringPayment = {
            id: 'rp_' + Date.now(),
            title,
            amount: Number(amount),
            category,
            billingDay: Number(billingDay),
            isActive: true
        };

        onSetRecurringPayments([...recurringPayments, newPayment]);

        // Reset Form
        setTitle('');
        setAmount('');
        setCategory('その他支出');
        setBillingDay('25');
        setShowAddForm(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('この月額支払いの記録を削除しますか？')) {
            const updated = recurringPayments.filter(p => p.id !== id);
            onSetRecurringPayments(updated);
        }
    };

    const handleToggleActive = (id: string) => {
        const updated = recurringPayments.map(p => {
            if (p.id === id) {
                return { ...p, isActive: !p.isActive };
            }
            return p;
        });
        onSetRecurringPayments(updated);
    };

    const handleRecordPayment = (payment: RecurringPayment) => {
        // 1. Register transaction expense
        onAddTransaction({
            title: `${payment.title} (定期支払)`,
            amount: payment.amount,
            type: 'expense',
            category: payment.category,
            date: `2026-05-${payment.billingDay.toString().padStart(2, '0')}`,
            note: '月額固定支払いの自動記録',
            isRecurringLog: true
        });

        // 2. Mark this payment as paid in current month of 2026-05
        const updated = recurringPayments.map(p => {
            if (p.id === payment.id) {
                return { ...p, lastPaidMonth: currentYearMonth };
            }
            return p;
        });
        onSetRecurringPayments(updated);
    };

    const totalMonthlyCost = recurringPayments
        .filter(p => p.isActive)
        .reduce((sum, p) => sum + p.amount, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            {/* Dynamic Summary Panel */}
            <div className="bg-white p-6 rounded-3xl border border-[#f0eee0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" id="recurring-payments-header">
                <div className="space-y-1">
                    <h2 className="font-serif font-black text-[#5a5a40] text-xl flex items-center gap-2.5">
                        <CreditCard className="text-[#a5a58d]" size={22} />
                        月額固定支払・サブスクリプション
                    </h2>
                    <p className="text-xs text-[#7a7a60]">毎月定額で発生する家賃、通信費、継続決済を記録して無駄遣いをスリム化。</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-[#faf9f2] border border-[#e5e4da] px-5 py-3 rounded-2xl">
                        <span className="text-[10px] text-[#9a9a80] font-bold uppercase font-sans tracking-wide block">ACTIVE MONTHLY TOTAL</span>
                        <span className="text-xl sm:text-2xl font-serif font-black text-[#5a5a40] tracking-tight block mt-0.5">
                            {formatCurrency(totalMonthlyCost)}
                        </span>
                    </div>

                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            id="add-recurring-btn"
                            className="flex items-center gap-1.5 bg-[#5a5a40] text-white font-sans text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#7a7a60] transition-all cursor-pointer"
                        >
                            <Plus size={14} className="stroke-[3]" />
                            固定費の追加
                        </button>
                    )}
                </div>
            </div>

            {/* Add subscription form */}
            {showAddForm && (
                <form
                    onSubmit={handleAddPayment}
                    id="recurring-payment-form"
                    className="bg-[#f2f1e9]/50 border border-[#e5e4da] p-6 rounded-3xl space-y-4 font-sans"
                >
                    <div className="flex items-center justify-between border-b border-[#e5e4da] pb-3">
                        <h3 className="font-serif font-bold text-[#5a5a40] text-sm md:text-base">月額固定支払いの新規登録</h3>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="text-xs text-[#7a7a60] hover:text-[#5a5a40] underline"
                        >
                            キャンセル
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5">固定費 / 項目名</label>
                            <input
                                type="text"
                                required
                                placeholder="例: 動画サブスク、ジム会費、スマホ通信料"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5">引落日 (日にち)</label>
                            <select
                                value={billingDay}
                                onChange={(e) => setBillingDay(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs text-[#3d3d3d]"
                            >
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <option key={day} value={day}>
                                        毎月 {day} 日
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5">金額</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="例: 1490"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-white border border-[#e5e4da] pl-6 pr-3 py-2.5 rounded-xl text-base md:text-xs"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a9a80] text-xs font-bold">¥</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#7a7a60] mb-1.5">カテゴリ</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs text-[#3d3d3d]"
                            >
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <option key={cat.name} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-[#5a5a40] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#7a7a60] transition-colors cursor-pointer"
                        >
                            固定費プランを登録
                        </button>
                    </div>
                </form>
            )}

            {/* Structured Monthly Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="recurring-payments-list">
                {recurringPayments.map((item) => {
                    const isPaidThisMonth = item.lastPaidMonth === currentYearMonth;
                    return (
                        <div
                            key={item.id}
                            id={`recurring-card-${item.id}`}
                            className={`bg-white border rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${item.isActive
                                    ? 'border-[#f0eee0] hover:border-[#e5e4da]'
                                    : 'border-[#f0eee0] bg-[#fdfcf8] opacity-60'
                                }`}
                        >
                            <div>
                                {/* Switch Activation Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-sans font-bold text-[#7a7a60] bg-[#f2f1e9] px-2.5 py-1 rounded-full border border-[#e5e4da]">
                                            {item.category}
                                        </span>
                                        <h4 className="font-serif font-bold text-[#3d3d3d] text-sm mt-2">{item.title}</h4>
                                    </div>

                                    {/* Active Slide Toggle Button */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive}
                                            onChange={() => handleToggleActive(item.id)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-[#f0eee0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5a5a40]"></div>
                                    </label>
                                </div>

                                {/* Due Date & Amount Info */}
                                <div className="flex items-baseline justify-between mt-4">
                                    <span className="text-[11px] font-sans text-[#9a9a80] flex items-center gap-1.5">
                                        <Calendar size={13} />
                                        毎月 {item.billingDay} 日引落
                                    </span>
                                    <span className="font-serif font-extrabold text-[#3d3d3d] text-base">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            </div>

                            {/* Status Action Bar */}
                            <div className="mt-4 pt-3 border-t border-[#f5f5f0] flex items-center justify-between gap-2">
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 text-[#9a9a80] hover:text-rose-600 hover:bg-[#faf9f2] rounded-lg transition-colors cursor-pointer"
                                    title="削除"
                                >
                                    <Trash2 size={13} />
                                </button>

                                {item.isActive ? (
                                    isPaidThisMonth ? (
                                        <span className="flex items-center gap-1 text-[11px] font-sans font-bold text-[#5a5a40] bg-[#faf9f2] px-3 py-1.5 rounded-full border border-[#e5e4da] shadow-sm">
                                            <CheckCircle2 size={12} className="stroke-[3]" />
                                            今月支払い済
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleRecordPayment(item)}
                                            className="flex items-center gap-1.5 text-[11px] font-sans font-bold text-[#5a5a40] bg-[#e8e7dd]/60 hover:bg-[#e8e7dd] px-4 py-1.5 rounded-full transition-all cursor-pointer border border-[#e5e4da]"
                                        >
                                            <RefreshCw size={11} className="mr-0.5 animate-spin-hover" />
                                            支払いを記録
                                        </button>
                                    )
                                ) : (
                                    <span className="text-[10px] font-sans text-[#9a9a80] flex items-center gap-1.5 italic">
                                        <AlertCircle size={12} />
                                        支払い一時停止中
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {recurringPayments.length === 0 && (
                    <div className="col-span-full py-8 text-center text-[#9a9a80] text-xs font-sans">
                        月額支払いはまだ登録されていません。
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecurringPaymentTracker;
