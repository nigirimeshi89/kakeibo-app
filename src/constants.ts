/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Transaction, SavingsGoal, RecurringPayment, QuickTemplate } from './types';

export const INCOME_CATEGORIES = [
    { name: '給与', color: '#5a5a40', icon: 'Briefcase' },
    { name: '副業', color: '#8c8c70', icon: 'Sparkles' },
    { name: 'お小遣い', color: '#a5a58d', icon: 'Gift' },
    { name: '配当金・投資', color: '#b7a18e', icon: 'TrendingUp' },
    { name: 'その他収入', color: '#d0cfb8', icon: 'CirclePlus' }
];

export const EXPENSE_CATEGORIES = [
    { name: '食費', color: '#a38570', icon: 'Utensils' },
    { name: '住居費', color: '#5a5a40', icon: 'Home' },
    { name: '日用品', color: '#b7a18e', icon: 'ShoppingBag' },
    { name: '水道光熱費', color: '#829c9c', icon: 'Droplet' },
    { name: '通信費', color: '#738c9c', icon: 'Wifi' },
    { name: '交際費', color: '#a88a90', icon: 'Users' },
    { name: '交通費', color: '#c2c2a3', icon: 'Train' },
    { name: '趣味・娯楽', color: '#cd9a82', icon: 'Gamepad2' },
    { name: '美容・衣服', color: '#bca0b0', icon: 'Sparkles' },
    { name: '保険・医療', color: '#7a8c7a', icon: 'Heart' },
    { name: 'その他支出', color: '#8a8a8a', icon: 'CircleEllipsis' }
];

export const CATEGORY_COLOR_MAP: Record<string, string> = {
    // Income
    '給与': '#5a5a40',
    '副業': '#8c8c70',
    'お小遣い': '#a5a58d',
    '配当金・投資': '#b7a18e',
    'その他収入': '#d0cfb8',
    // Expense
    '食費': '#a38570',
    '住居費': '#5a5a40',
    '日用品': '#b7a18e',
    '水道光熱費': '#829c9c',
    '通信費': '#738c9c',
    '交際費': '#a88a90',
    '交通費': '#c2c2a3',
    '趣味・娯楽': '#cd9a82',
    '美容・衣服': '#bca0b0',
    '保険・医療': '#7a8c7a',
    'その他支出': '#8a8a8a'
};

// Default dynamic seed data based on current date (May 2026)
const getFormattedDate = (offsetDays: number): string => {
    const date = new Date(2026, 4, 22); // Target default index time around May 22, 2026
    date.setDate(date.getDate() - offsetDays);
    return date.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: 't1',
        title: '4月分 給与',
        amount: 280000,
        type: 'income',
        category: '給与',
        date: getFormattedDate(22), // 2026-04-30
        note: '基本給と残業代込み'
    },
    {
        id: 't2',
        title: 'スーパーでの買い出し',
        amount: 5420,
        type: 'expense',
        category: '食費',
        date: getFormattedDate(2), // 2026-05-20
        note: '一週間分の食材'
    },
    {
        id: 't3',
        title: '家賃',
        amount: 72000,
        type: 'expense',
        category: '住居費',
        date: getFormattedDate(21), // 2026-05-01
        note: '5月分家賃'
    },
    {
        id: 't4',
        title: 'カフェ代',
        amount: 680,
        type: 'expense',
        category: '食費',
        date: getFormattedDate(1), // 2026-05-21
        note: '勉強用コーヒー'
    },
    {
        id: 't5',
        title: 'メルカリ売上',
        amount: 3200,
        type: 'income',
        category: 'その他収入',
        date: getFormattedDate(5),
        note: '不用品処分'
    },
    {
        id: 't6',
        title: '電気代',
        amount: 6800,
        type: 'expense',
        category: '水道光熱費',
        date: getFormattedDate(10),
        note: '4月使用分'
    },
    {
        id: 't7',
        title: '友達との飲み会',
        amount: 5000,
        type: 'expense',
        category: '交際費',
        date: getFormattedDate(6),
        note: '居酒屋'
    },
    {
        id: 't8',
        title: '定期圏外の電車運賃',
        amount: 440,
        type: 'expense',
        category: '交通費',
        date: getFormattedDate(3),
        note: '梅田往復'
    },
    {
        id: 't9',
        title: '本「資産形成入門」',
        amount: 1980,
        type: 'expense',
        category: '趣味・娯楽',
        date: getFormattedDate(8)
    }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
    {
        title: 'ハワイ旅行資金',
        targetAmount: 300000,
        currentAmount: 120000,
        targetDate: '2026-12-31'
    },
    {
        title: '新生活スタート貯金',
        targetAmount: 1000000,
        currentAmount: 450000,
        targetDate: '2027-05-01'
    }
];

export const INITIAL_RECURRING_PAYMENTS: RecurringPayment[] = [
    {
        id: 'r1',
        title: '動画サブスクリプション (Netflix)',
        amount: 1490,
        category: '趣味・娯楽',
        billingDay: 15,
        isActive: true,
        lastPaidMonth: '2026-05'
    },
    {
        id: 'r2',
        title: 'スマホ通信費 (格安SIM)',
        amount: 3280,
        category: '通信費',
        billingDay: 25,
        isActive: true,
        lastPaidMonth: '2026-04'
    },
    {
        id: 'r3',
        title: 'ジム月会費',
        amount: 7700,
        category: '趣味・娯楽',
        billingDay: 5,
        isActive: true,
        lastPaidMonth: '2026-05'
    },
    {
        id: 'r4',
        title: 'サーバーホスティング代',
        amount: 1100,
        category: '通信費',
        billingDay: 1,
        isActive: false
    }
];

export const INITIAL_QUICK_TEMPLATES: QuickTemplate[] = [
    {
        id: 'q1',
        title: 'いつものランチ',
        amount: 850,
        type: 'expense',
        category: '食費'
    },
    {
        id: 'q2',
        title: 'コンビニ買い出し',
        amount: 500,
        type: 'expense',
        category: '日用品'
    },
    {
        id: 'q3',
        title: 'カフェ代',
        amount: 450,
        type: 'expense',
        category: '食費'
    },
    {
        id: 'q4',
        title: 'スーパーでの買い物',
        amount: 3500,
        type: 'expense',
        category: '食費'
    },
    {
        id: 'q5',
        title: '自販機・ドリンク',
        amount: 160,
        type: 'expense',
        category: '日用品'
    }
];

