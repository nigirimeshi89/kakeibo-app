/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { CATEGORY_COLOR_MAP, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { CategoryIcon } from './CategoryIcon';
import { Search, Calendar, Trash2, Download, Upload } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
    onDeleteTransaction: (id: string) => void;
    selectedCategoryFilter: string | null;
    onClearCategoryFilter: () => void;
    onImportTransactions: (imported: any[]) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    onDeleteTransaction,
    selectedCategoryFilter,
    onClearCategoryFilter,
    onImportTransactions
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [monthFilter, setMonthFilter] = useState<string>('all');

    // Find all unique months represented in the transactions to build dynamic month options
    const monthOptions = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach(t => {
            if (t.date) {
                months.add(t.date.substring(0, 7)); // "YYYY-MM"
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a)); // Newest first
    }, [transactions]);

    // Combined searching and filtering
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // 1. Text Search
            const textMatch =
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()));

            // 2. Type Filter
            const typeMatch = typeFilter === 'all' || t.type === typeFilter;

            // 3. Category Filter (Linked to standard selectedCategory pointer)
            const categoryMatch = !selectedCategoryFilter || t.category === selectedCategoryFilter;

            // 4. Month Filter
            const monthMatch = monthFilter === 'all' || (t.date && t.date.startsWith(monthFilter));

            return textMatch && typeMatch && categoryMatch && monthMatch;
        });
    }, [transactions, searchTerm, typeFilter, selectedCategoryFilter, monthFilter]);

    // Handle CSV Export with UTF-8 BOM so Excel displays Japanese characters correctly
    const handleExportCSV = () => {
        const headers = ['ID', '日付', '取引名', '金額', 'タイプ', 'カテゴリ', 'メモ'];
        const csvRows = [headers.join(',')];

        transactions.forEach(t => {
            const row = [
                t.id,
                t.date,
                `"${t.title.replace(/"/g, '""')}"`,
                t.amount,
                t.type === 'income' ? '収入' : '支出',
                `"${t.category.replace(/"/g, '""')}"`,
                `"${(t.note || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
        const blob = new Blob([bom, csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `kakeibo_backup_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle CSV Import
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split(/\r?\n/);
                const imported: Omit<Transaction, 'id'>[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Simple CSV parsing (handles simple double quotations)
                    const parts = line.split(',');
                    if (parts.length < 5) continue;

                    const clean = (str: string) => str.replace(/^"|"$/g, '').replace(/""/g, '"').trim();

                    const date = clean(parts[1] || new Date().toISOString().split('T')[0]);
                    const title = clean(parts[2] || 'インポートデータ');
                    const amount = parseFloat(clean(parts[3] || '0')) || 0;
                    const typeStr = clean(parts[4] || '支出');
                    const type: 'income' | 'expense' = typeStr === '収入' ? 'income' : 'expense';
                    const category = clean(parts[5] || 'その他支出');
                    const note = parts[6] ? clean(parts[6]) : '';

                    imported.push({
                        date,
                        title,
                        amount,
                        type,
                        category,
                        note
                    });
                }

                if (imported.length > 0) {
                    onImportTransactions(imported);
                    alert(`${imported.length}件の取引データをインポートしました！`);
                } else {
                    alert('有効な取引CSVレコードが見つかりませんでした。');
                }
            } catch (err) {
                console.error(err);
                alert('CSVファイルのパースに失敗しました。フォーマットを確認してください。');
            }
        };
        reader.readAsText(file);
        // Reset file input so a user can re-import the same file
        e.target.value = '';
    };

    // Helper properties
    const getCategoryIconName = (categoryName: string, type: 'income' | 'expense') => {
        const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        const found = list.find(c => c.name === categoryName);
        return found ? found.icon : 'CircleEllipsis';
    };

    const getCategoryColor = (categoryName: string) => {
        return CATEGORY_COLOR_MAP[categoryName] || '#9CA3AF';
    };

    const formatCurrency = (val: number, type: 'income' | 'expense') => {
        const prefix = type === 'income' ? '+' : '-';
        const formatted = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
        return `${prefix}${formatted}`;
    };

    return (
        <div className="bg-white border border-[#f0eee0] rounded-3xl p-6 shadow-sm space-y-4">
            {/* List Header and quick info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f5f0] pb-4">
                <div>
                    <h3 className="font-serif font-bold text-[#3d3d3d] text-base">家計簿履歴 ・ 取引一覧</h3>
                    <p className="text-[10px] text-[#9a9a80]">日々の支出・収入を詳細に絞り込んで一覧を視認・管理できます。</p>
                </div>

                {/* CSV and Filters Panel */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* CSV Tools */}
                    <div className="flex items-center gap-1.5 mr-1">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1 bg-[#f5f4eb] hover:bg-[#eae9db] border border-[#d6d5c6] text-[#5a5a40] text-[10px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs"
                            title="データをCSVファイルに書き出し"
                        >
                            <Download size={11} />
                            <span>CSV保存</span>
                        </button>
                        <label
                            className="flex items-center gap-1 bg-[#f5f4eb] hover:bg-[#eae9db] border border-[#d6d5c6] text-[#5a5a40] text-[10px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs"
                            title="CSVデータから取引履歴を一括読込"
                        >
                            <Upload size={11} />
                            <span>CSV読込</span>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImportCSV}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {selectedCategoryFilter && (
                        <div className="flex items-center gap-1.5 bg-[#faf9f2] text-[#5a5a40] px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#e5e4da] shadow-sm animate-fade-in">
                            <span>カテゴリ: {selectedCategoryFilter}</span>
                            <button
                                onClick={onClearCategoryFilter}
                                className="hover:text-red-500 font-bold ml-1 text-sm cursor-pointer"
                                title="フィルター解除"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <span className="text-[10px] font-sans font-bold bg-[#f2f1e9] text-[#7a7a60] border border-[#e5e4da]/40 px-3 py-1 rounded-full">
                        合計 {filteredTransactions.length} 件
                    </span>
                </div>
            </div>

            {/* Interactive Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3" id="filters-container">
                {/* Search Searchbar */}
                <div className="md:col-span-5 relative">
                    <input
                        type="text"
                        placeholder="内容やメモ、タグで検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-[#e5e4da] pl-8 pr-3 py-2.5 rounded-xl text-base md:text-xs font-sans text-[#3d3d3d] placeholder-[#9a9a80]"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a9a80]" size={13} />
                </div>

                {/* Period dropdown */}
                <div className="md:col-span-3">
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="w-full bg-white border border-[#e5e4da] px-3.5 py-2.5 rounded-xl text-base md:text-xs font-sans text-[#3d3d3d] focus:outline-none"
                    >
                        <option value="all">すべての月</option>
                        {monthOptions.map(m => (
                            <option key={m} value={m}>
                                {m.replace('-', '年')}月
                            </option>
                        ))}
                    </select>
                </div>

                {/* Type selector Segmented button */}
                <div className="md:col-span-4 flex bg-[#f2f1e9]/60 border border-[#e5e4da] p-1.5 rounded-2xl">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`flex-1 text-center font-sans text-[11px] font-bold py-1.5 rounded-xl transition-colors cursor-pointer ${typeFilter === 'all' ? 'bg-white text-[#5a5a40] shadow-sm' : 'text-[#7a7a60]'
                            }`}
                    >
                        すべて
                    </button>
                    <button
                        onClick={() => setTypeFilter('expense')}
                        className={`flex-1 text-center font-sans text-[11px] font-bold py-1.5 rounded-xl transition-colors cursor-pointer ${typeFilter === 'expense' ? 'bg-white text-[#5a5a40] shadow-sm' : 'text-[#7a7a60]'
                            }`}
                    >
                        支出
                    </button>
                    <button
                        onClick={() => setTypeFilter('income')}
                        className={`flex-1 text-center font-sans text-[11px] font-bold py-1.5 rounded-xl transition-colors cursor-pointer ${typeFilter === 'income' ? 'bg-white text-[#5a5a40] shadow-sm' : 'text-[#7a7a60]'
                            }`}
                    >
                        収入
                    </button>
                </div>
            </div>

            {/* List content container */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1" id="transactions-render-grid">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[#e5e4da] rounded-2xl">
                        <span className="text-[#9a9a80] text-xs font-sans block">該当する収支データが見つかりませんでした。</span>
                        <span className="text-[#9a9a80] text-[10px] block mt-1.5">
                            条件を変更するか、左のフォームから新しい取引を記録してください。
                        </span>
                    </div>
                ) : (
                    filteredTransactions.map((t) => {
                        const isInc = t.type === 'income';
                        const catColor = getCategoryColor(t.category);
                        const iconName = getCategoryIconName(t.category, t.type);

                        return (
                            <div
                                key={t.id}
                                id={`transaction-item-${t.id}`}
                                className="group flex items-center justify-between p-3.5 border border-[#f5f5f0] hover:border-[#e5e4da] hover:bg-[#faf9f2]/30 rounded-2xl transition-all"
                            >
                                {/* Left side: Category Icon + Title information */}
                                <div className="flex items-center gap-3">
                                    <CategoryIcon name={iconName} color={catColor} />

                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#3d3d3d] font-sans group-hover:text-[#5a5a40] transition-colors">
                                                {t.title}
                                            </span>
                                            {t.isRecurringLog && (
                                                <span className="text-[9px] font-sans font-bold bg-[#faf9f2] text-[#5a5a40] border border-[#e5e4da] px-1.5 py-0.5 rounded-md">
                                                    固定費
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-[#9a9a80] font-sans">
                                            <span className="flex items-center gap-0.5">
                                                <Calendar size={10} />
                                                {t.date.replace(/-/g, '/')}
                                            </span>
                                            <span>•</span>
                                            <span style={{ color: catColor }} className="font-bold">
                                                {t.category}
                                            </span>
                                            {t.note && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-[#9a9a80] italic">「{t.note}」</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Amount and Deletion controls */}
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`font-serif font-black text-sm tracking-tight ${isInc ? 'text-[#5a5a40]' : 'text-[#3d3d3d]'
                                            }`}
                                    >
                                        {formatCurrency(t.amount, t.type)}
                                    </span>

                                    <button
                                        onClick={() => onDeleteTransaction(t.id)}
                                        className="p-1 px-1.5 text-[#9a9a80] hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="取引記録を削除"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TransactionList;
