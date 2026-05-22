import React, { useState } from 'react';
import type { Transaction } from '../types';
import { CATEGORY_COLOR_MAP } from '../constants';
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight, ArrowDownRight, Calendar as CalIcon } from 'lucide-react';

interface MoneyCalendarProps {
    transactions: Transaction[];
    onAddTransactionRequested: (dateStr: string) => void;
}

export const MoneyCalendar: React.FC<MoneyCalendarProps> = ({
    transactions,
    onAddTransactionRequested
}) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
        new Date().toISOString().split('T')[0]
    );

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-based

    // Calendar dates generation
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
        const prevMonthDaysCount = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            prevMonthDays.push(new Date(year, month - 1, prevMonthDaysCount - i));
        }
    }

    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
        currentMonthDays.push(new Date(year, month, i));
    }

    const totalCells = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextMonthDays = [];
    for (let i = 1; i <= nextMonthDaysCount; i++) {
        nextMonthDays.push(new Date(year, month + 1, i));
    }

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    // Helper date string
    const getDateString = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const selectedTransactions = selectedDateStr
        ? transactions.filter((t) => t.date === selectedDateStr)
        : [];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
    };

    // Aggregated sums per date
    const dateTotals = React.useMemo(() => {
        const totals: Record<string, { income: number; expense: number }> = {};
        transactions.forEach((t) => {
            if (!t.date) return;
            if (!totals[t.date]) {
                totals[t.date] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                totals[t.date].income += t.amount;
            } else {
                totals[t.date].expense += t.amount;
            }
        });
        return totals;
    }, [transactions]);

    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    return (
        <div className="bg-white border border-[#f0eee0] rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#f2f1e9] text-[#5a5a40] rounded-xl">
                        <CalIcon size={18} />
                    </div>
                    <div>
                        <h3 className="font-serif font-semibold text-lg text-[#3d3d3d]">
                            収支カレンダー
                        </h3>
                        <p className="text-[10px] text-[#9a9a80]">日々の支出・収入をカレンダーで確認</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-[#f2f1e9] text-[#7a7a60] hover:text-[#5a5a40] rounded-lg transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="font-serif font-black text-sm text-[#5a5a40] bg-[#f2f1e9] px-3.5 py-1 rounded-full">
                        {year}年 {month + 1}月
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-[#f2f1e9] text-[#7a7a60] hover:text-[#5a5a40] rounded-lg transition-colors cursor-pointer"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {daysOfWeek.map((day, idx) => (
                    <div
                        key={day}
                        className={`text-[10px] py-1 font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-[#9a9a80]'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 bg-[#fbfbfa] p-1 rounded-2xl border border-[#f0eee0]">
                {allDays.map((date, idx) => {
                    const dateStr = getDateString(date);
                    const isCurrentMonth = date.getMonth() === month;
                    const totals = dateTotals[dateStr];
                    const isSelected = selectedDateStr === dateStr;

                    return (
                        <button
                            key={`${dateStr}-${idx}`}
                            onClick={() => setSelectedDateStr(dateStr)}
                            className={`min-h-[52px] sm:min-h-[64px] flex flex-col justify-between items-center p-1 rounded-xl transition-all cursor-pointer relative ${isCurrentMonth ? 'text-[#3d3d3d]' : 'text-gray-300'
                                } ${isSelected
                                    ? 'bg-[#5a5a40] text-white shadow-sm ring-1 ring-[#5a5a40]'
                                    : 'hover:bg-[#f2f1e9]/60'
                                }`}
                        >
                            <span className="text-[10px] font-sans font-bold self-start pl-0.5 sm:pl-1">
                                {date.getDate()}
                            </span>

                            {/* Day's income and expense micro aggregates */}
                            <div className="w-full text-center space-y-0.5 pb-0.5 sm:pb-1">
                                {totals && totals.income > 0 && (
                                    <div
                                        className={`text-[7px] sm:text-[9px] font-sans overflow-hidden text-ellipsis whitespace-nowrap px-0.5 rounded leading-tight ${isSelected ? 'text-[#e5ffeb]' : 'text-green-600 font-bold'
                                            }`}
                                    >
                                        +{totals.income >= 10000 ? `${Math.round(totals.income / 1000)}k` : totals.income}
                                    </div>
                                )}
                                {totals && totals.expense > 0 && (
                                    <div
                                        className={`text-[7px] sm:text-[9px] font-sans overflow-hidden text-ellipsis whitespace-nowrap px-0.5 rounded leading-tight ${isSelected ? 'text-[#ffd3d3]' : 'text-red-500 font-bold'
                                            }`}
                                    >
                                        -{totals.expense >= 10000 ? `${Math.round(totals.expense / 1000)}k` : totals.expense}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected day transaction summaries panel */}
            {selectedDateStr && (
                <div className="mt-6 bg-[#fbfbfa] border border-[#f0eee0] rounded-2xl p-4 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="font-serif font-black text-sm text-[#5a5a40]">
                                {selectedDateStr.replace(/-/g, '/')}
                            </span>
                            <span className="text-xs text-[#9a9a80] ml-2">の支出・収入ログ</span>
                        </div>
                        <button
                            onClick={() => onAddTransactionRequested(selectedDateStr)}
                            className="flex items-center gap-1 bg-[#5a5a40] hover:bg-[#4a4a35] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm transition-all cursor-pointer"
                        >
                            <Plus size={10} strokeWidth={3} />
                            <span>この日に記録</span>
                        </button>
                    </div>

                    {selectedTransactions.length === 0 ? (
                        <div className="text-center py-6 text-xs text-[#9a9a80]">
                            この日の取引はまだ登録されていません
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {selectedTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#f0eee0]"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-1.5 h-6 rounded-full shrink-0"
                                            style={{ backgroundColor: CATEGORY_COLOR_MAP[tx.category] || '#ccc' }}
                                        />
                                        <div>
                                            <h4 className="text-xs font-bold text-[#3d3d3d] max-w-[150px] truncate">{tx.title}</h4>
                                            <p className="text-[10px] text-[#9a9a80]">
                                                {tx.category} {tx.note && `• ${tx.note}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-right font-serif">
                                        {tx.type === 'income' ? (
                                            <span className="text-xs font-black text-green-600 flex items-center">
                                                <ArrowUpRight size={10} className="mr-0.5" />
                                                +{formatCurrency(tx.amount)}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-black text-red-500 flex items-center">
                                                <ArrowDownRight size={10} className="mr-0.5" />
                                                -{formatCurrency(tx.amount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
