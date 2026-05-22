/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export type Transaction = {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string; // YYYY-MM-DD
    note?: string;
    isRecurringLog?: boolean; // Whether it was generated from recurring payments
}

export type SavingsGoal = {
    id?: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // YYYY-MM-DD
}

export type RecurringPayment = {
    id: string;
    title: string;
    amount: number;
    category: string;
    billingDay: number; // For example: 10 means 10th of every month
    isActive: boolean;
    lastPaidMonth?: string; // YYYY-MM
}

export type CategoryBudget = {
    category: string;
    budgetAmount: number;
}

export type QuickTemplate = {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
}
