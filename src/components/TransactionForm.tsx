/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionType, QuickTemplate } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Tag, Calendar, Notebook, Sparkles, Heart, Trash2 } from 'lucide-react';

interface TransactionFormProps {
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    selectedCategoryFromFilter: string | null;
    prefilledDate?: string | null;
    onClearPrefilledDate?: () => void;
    quickTemplates: QuickTemplate[];
    onAddQuickTemplate: (template: Omit<QuickTemplate, 'id'>) => void;
    onDeleteQuickTemplate: (id: string) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
    onAddTransaction,
    selectedCategoryFromFilter,
    prefilledDate,
    onClearPrefilledDate,
    quickTemplates,
    onAddQuickTemplate,
    onDeleteQuickTemplate
}) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(() => {
        // Default date is today (May 22, 2026 based on mock clock index)
        return '2026-05-22';
    });
    const [note, setNote] = useState('');
    const [showTemplatePanel, setShowTemplatePanel] = useState(true);

    // Update category dropdown choices depending on Expense/Income toggle
    useEffect(() => {
        if (type === 'income') {
            setCategory(INCOME_CATEGORIES[0].name);
        } else {
            setCategory(selectedCategoryFromFilter || EXPENSE_CATEGORIES[0].name);
        }
    }, [type, selectedCategoryFromFilter]);

    // Update date if prefilledDate is loaded from Calendar view
    useEffect(() => {
        if (prefilledDate) {
            setDate(prefilledDate);
            if (onClearPrefilledDate) {
                onClearPrefilledDate();
            }
        }
    }, [prefilledDate, onClearPrefilledDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !title || !category || !date) return;

        onAddTransaction({
            title,
            amount: Number(amount),
            type,
            category,
            date,
            note: note.trim() || undefined
        });

        // Reset inputs
        setTitle('');
        setAmount('');
        setNote('');
    };

    const handleQuickTap = (q: QuickTemplate) => {
        onAddTransaction({
            title: q.title,
            amount: q.amount,
            type: q.type,
            category: q.category,
            date, // current selected date on the form, defaults to today
            note: 'クイック入力から記録'
        });
    };

    // Add current active inputs as a new Quick Template favorite
    const handleRegisterCurrentAsTemplate = () => {
        if (!title || !amount || !category) {
            alert('お気に入りに追加するには、内容・金額・カテゴリを入力してください。');
            return;
        }
        onAddQuickTemplate({
            title,
            amount: Number(amount),
            type,
            category
        });
        alert(`「${title} (¥${amount})」をお気に入りに登録しました。`);
    };

    return (
        <div className="space-y-4">
            {/* Quick Favorite Entry Grid (Requested Feature 1) */}
            <div className="bg-white border border-[#f0eee0] p-5 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#faf9f2] text-[#5a5a40] flex items-center justify-center border border-[#e5e4da]">
                            <Heart size={15} fill="#5a5a40" strokeWidth={0} />
                        </div>
                        <div>
                            <h4 className="font-serif font-black text-xs text-[#3d3d3d]">ワンタップ「お気に入り入力」</h4>
                            <p className="text-[9px] text-[#9a9a80]">よく使うパターンをタップして一瞬で登録完了</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTemplatePanel(!showTemplatePanel)}
                        className="text-[10px] font-sans font-bold text-[#7a7a60] hover:text-[#5a5a40] cursor-pointer"
                    >
                        {showTemplatePanel ? '非表示' : '表示する'}
                    </button>
                </div>

                {showTemplatePanel && (
                    <div className="space-y-2">
                        {quickTemplates.length === 0 ? (
                            <p className="text-[10px] text-center text-[#9a9a80] py-4 bg-[#fbfbfa] rounded-xl border border-dashed border-[#e5e4da]">
                                お気に入りはありません。下のフォームから登録できます！
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                                {quickTemplates.map((q) => (
                                    <div
                                        key={q.id}
                                        className="relative group bg-[#fbfbfa] border border-[#f0eee0] hover:border-[#5a5a40] rounded-xl p-2.5 transition-all flex items-start justify-between cursor-pointer"
                                        onClick={() => handleQuickTap(q)}
                                    >
                                        <div className="space-y-1 pr-4">
                                            <div className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: q.type === 'income' ? '#5a5a40' : '#a38570' }} />
                                                <span className="text-[10px] text-[#5a5a40] font-sans font-bold bg-[#f2f1e9] px-1.5 py-0.5 rounded">
                                                    {q.category}
                                                </span>
                                            </div>
                                            <h5 className="font-sans font-black text-xs text-[#3d3d3d] truncate w-24" title={q.title}>
                                                {q.title}
                                            </h5>
                                            <p className="font-serif font-bold text-xs text-[#5a5a40]">
                                                ¥{new Intl.NumberFormat('ja-JP').format(q.amount)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent adding transaction when deleting template
                                                onDeleteQuickTemplate(q.id);
                                            }}
                                            className="absolute top-2 right-2 duration-200 text-[#9a9a80] hover:text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer md:opacity-0 group-hover:opacity-100"
                                            title="お気に入りから削除"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Adding Form */}
            <div className="bg-white border border-[#f0eee0] p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[#f2f1e9] flex items-center justify-center text-[#5a5a40]">
                        <PlusCircle size={19} />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-[#3d3d3d] text-sm">スピード記録</h3>
                        <p className="text-[10px] text-[#9a9a80]">日常のお買い物や収入をその場ですぐに入力できます。</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} id="transaction-add-form" className="space-y-4 font-sans text-xs">
                    {/* Toggle Income/Expense tab */}
                    <div className="grid grid-cols-2 gap-2 bg-[#f2f1e9]/60 p-1.5 rounded-2xl border border-[#e5e4da]">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex items-center justify-center gap-1.5 py-2.5 font-bold rounded-xl transition-all cursor-pointer ${type === 'expense'
                                    ? 'bg-[#a38570] text-white shadow-sm'
                                    : 'text-[#7a7a60] hover:text-[#5a5a40]'
                                }`}
                        >
                            <ArrowDownRight size={14} />
                            支出
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex items-center justify-center gap-1.5 py-2.5 font-bold rounded-xl transition-all cursor-pointer ${type === 'income'
                                    ? 'bg-[#5a5a40] text-white shadow-sm'
                                    : 'text-[#7a7a60] hover:text-[#5a5a40]'
                                }`}
                        >
                            <ArrowUpRight size={14} />
                            収入
                        </button>
                    </div>

                    {/* Input parameters */}
                    <div className="space-y-3.5">
                        {/* Amount */}
                        <div>
                            <label className="block text-[#7a7a60] font-bold mb-1.5">金額 (日本円)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="例: 1280"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-white border border-[#e5e4da] pl-8 pr-12 py-2.5 rounded-xl font-serif font-black text-base md:text-sm"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a80] font-bold">¥</span>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a80]">円</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-[#7a7a60] font-bold mb-1.5">内容 / 項目名</label>
                            <input
                                type="text"
                                required
                                placeholder="例: スーパー買い出し、カフェ代、給料"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Category selection */}
                            <div>
                                <label className="block text-[#7a7a60] font-bold mb-1.5 flex items-center gap-1">
                                    <Tag size={12} className="text-[#9a9a80]" />
                                    カテゴリ
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs text-[#3d3d3d] focus:outline-none"
                                >
                                    {type === 'expense'
                                        ? EXPENSE_CATEGORIES.map((cat) => (
                                            <option key={cat.name} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))
                                        : INCOME_CATEGORIES.map((cat) => (
                                            <option key={cat.name} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-[#7a7a60] font-bold mb-1.5 flex items-center gap-1">
                                    <Calendar size={12} className="text-[#9a9a80]" />
                                    日付
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-white border border-[#e5e4da] px-3 py-2 rounded-xl text-base md:text-xs text-[#3d3d3d]"
                                />
                            </div>
                        </div>

                        {/* Optional remarks note */}
                        <div>
                            <label className="block text-[#7a7a60] font-bold mb-1.5 flex items-center gap-1">
                                <Notebook size={12} className="text-[#9a9a80]" />
                                メモ (任意・タグなど)
                            </label>
                            <input
                                type="text"
                                placeholder="例: クレジット決済、ご褒美ディナー"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Quick Template Register Trigger */}
                        <button
                            type="button"
                            onClick={handleRegisterCurrentAsTemplate}
                            className="flex-1 text-[#5a5a40] font-bold py-3 px-3 rounded-full border border-[#5a5a40]/30 hover:bg-[#faf9f2] transition-colors flex items-center justify-center gap-1 bg-white cursor-pointer"
                            title="このパターンの内容をお気に入り(お気に入りテンプレート)に保存します"
                        >
                            <Heart size={12} className="text-[#5a5a40]" fill="#5a5a40" strokeWidth={0} />
                            <span>お気に入り登録</span>
                        </button>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`flex-[2] text-white font-bold py-3 rounded-full font-sans text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${type === 'expense'
                                    ? 'bg-[#a38570] hover:bg-[#8c6d59] shadow-sm shadow-[#a38570]/10'
                                    : 'bg-[#5a5a40] hover:bg-[#7a7a60] shadow-sm shadow-[#5a5a40]/10'
                                }`}
                        >
                            {type === 'expense' ? '支出を記録' : '収入を記録'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
