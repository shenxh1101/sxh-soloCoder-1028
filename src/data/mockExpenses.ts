import type { Expense, Budget } from '@/types/travel'

export const mockBudget: Budget = {
  total: 15000,
  currency: 'CNY',
  spent: 8560
}

export const mockExpenses: Expense[] = [
  {
    id: 'expense-1',
    amount: 2800,
    currency: 'CNY',
    category: '交通',
    description: '北京往返高铁票',
    date: '2024-06-14',
    splitAmong: ['张三', '李四'],
    paidBy: '张三'
  },
  {
    id: 'expense-2',
    amount: 1200,
    currency: 'CNY',
    category: '住宿',
    description: '王府半岛酒店两晚',
    date: '2024-06-15',
    splitAmong: ['张三', '李四'],
    paidBy: '李四'
  },
  {
    id: 'expense-3',
    amount: 120,
    currency: 'CNY',
    category: '门票',
    description: '故宫博物院门票',
    date: '2024-06-15',
    splitAmong: ['张三', '李四'],
    paidBy: '张三'
  },
  {
    id: 'expense-4',
    amount: 568,
    currency: 'CNY',
    category: '餐饮',
    description: '全聚德烤鸭午餐',
    date: '2024-06-15',
    splitAmong: ['张三', '李四', '王五'],
    paidBy: '张三'
  },
  {
    id: 'expense-5',
    amount: 45,
    currency: 'CNY',
    category: '交通',
    description: '长城打车费',
    date: '2024-06-15',
    splitAmong: ['张三', '李四'],
    paidBy: '李四'
  },
  {
    id: 'expense-6',
    amount: 268,
    currency: 'CNY',
    category: '餐饮',
    description: '王府井小吃街晚餐',
    date: '2024-06-15',
    splitAmong: ['张三', '李四'],
    paidBy: '张三'
  },
  {
    id: 'expense-7',
    amount: 3800,
    currency: 'CNY',
    category: '住宿',
    description: '上海金茂君悦大酒店三晚',
    date: '2024-06-17',
    splitAmong: ['张三', '李四'],
    paidBy: '张三'
  },
  {
    id: 'expense-8',
    amount: 159,
    currency: 'CNY',
    category: '餐饮',
    description: '南翔小笼午餐',
    date: '2024-06-18',
    splitAmong: ['张三', '李四'],
    paidBy: '李四'
  }
]
