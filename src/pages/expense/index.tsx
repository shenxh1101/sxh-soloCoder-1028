import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import { mockExpenses, mockBudget } from '@/data/mockExpenses'
import ExpenseCard from '@/components/ExpenseCard'
import {
  convertCurrency,
  formatCurrency,
  currencyNames,
  getAvailableCurrencies
} from '@/utils/currency'
import type { Currency } from '@/types/travel'

interface CategoryStat {
  name: string
  icon: string
  total: number
}

const ExpensePage: React.FC = () => {
  const {
    expenses,
    budget,
    addExpense,
    removeExpense,
    setBudget
  } = useTravelStore()

  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('CNY')

  useEffect(() => {
    if (!isInitialized && expenses.length === 0) {
      console.log('[ExpensePage] Initializing with mock data')
      setBudget(mockBudget.total, mockBudget.currency)
      mockExpenses.forEach((expense) => {
        addExpense({
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          splitAmong: expense.splitAmong,
          paidBy: expense.paidBy
        })
      })
      setIsInitialized(true)
    }
  }, [isInitialized, expenses.length, addExpense, setBudget])

  const convertedBudget = useMemo(() => ({
    ...budget,
    total: convertCurrency(budget.total, budget.currency, selectedCurrency),
    spent: convertCurrency(budget.spent, budget.currency, selectedCurrency)
  }), [budget, selectedCurrency])

  const remaining = convertedBudget.total - convertedBudget.spent
  const progressPercent = Math.min((convertedBudget.spent / convertedBudget.total) * 100, 100)
  const isOverBudget = remaining < 0

  const categoryStats = useMemo((): CategoryStat[] => {
    const stats: Record<string, CategoryStat> = {
      交通: { name: '交通', icon: '🚄', total: 0 },
      住宿: { name: '住宿', icon: '🏨', total: 0 },
      餐饮: { name: '餐饮', icon: '🍜', total: 0 },
      门票: { name: '门票', icon: '🎫', total: 0 },
      其他: { name: '其他', icon: '💰', total: 0 }
    }

    expenses.forEach((exp) => {
      const category = stats[exp.category] ? exp.category : '其他'
      const converted = convertCurrency(exp.amount, exp.currency, selectedCurrency)
      stats[category].total += converted
    })

    return Object.values(stats).filter((s) => s.total > 0)
  }, [expenses, selectedCurrency])

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses])

  const handleCurrencyChange = (currency: Currency) => {
    console.log('[ExpensePage] Currency changed:', currency)
    setSelectedCurrency(currency)
  }

  const handleAddExpense = () => {
    console.log('[ExpensePage] Add expense clicked')
    Taro.navigateTo({
      url: '/pages/add-expense/index'
    })
  }

  const handleDeleteExpense = (id: string) => {
    console.log('[ExpensePage] Delete expense:', id)
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条消费记录吗？',
      success: (res) => {
        if (res.confirm) {
          removeExpense(id)
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>费用管理</Text>

        <View className={styles.budgetCard}>
          <View className={styles.budgetRow}>
            <View className={styles.spentSection}>
              <Text className={styles.spentLabel}>已花费</Text>
              <Text className={styles.spentAmount}>
                {formatCurrency(convertedBudget.spent, selectedCurrency)}
              </Text>
            </View>
            <View className={styles.budgetSection}>
              <Text className={styles.budgetLabel}>总预算</Text>
              <Text className={styles.budgetAmount}>
                {formatCurrency(convertedBudget.total, selectedCurrency)}
              </Text>
            </View>
          </View>

          <View className={styles.remainingSection}>
            <Text className={styles.remainingLabel}>
              {isOverBudget ? '已超支' : '剩余预算'}
            </Text>
            <Text
              className={classnames(
                styles.remainingAmount,
                isOverBudget && styles.overBudget
              )}
            >
              {isOverBudget ? '-' : ''}
              {formatCurrency(Math.abs(remaining), selectedCurrency)}
            </Text>
          </View>

          <View className={styles.progressBar}>
            <View
              className={classnames(
                styles.progressFill,
                isOverBudget && styles.overBudget
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        className={styles.currencySelector}
        scrollX
        showScrollbar={false}
      >
        {getAvailableCurrencies().map((currency) => (
          <View
            key={currency}
            className={classnames(
              styles.currencyItem,
              selectedCurrency === currency && styles.active
            )}
            onClick={() => handleCurrencyChange(currency)}
          >
            <Text className={styles.currencyText}>
              {currency} · {currencyNames[currency]}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        scrollY
        refresherEnabled
        onRefresherRefresh={() => {
          console.log('[ExpensePage] Pull to refresh')
          setTimeout(() => {
            Taro.stopPullDownRefresh()
          }, 1000)
        }}
      >
        <View className={styles.statsGrid}>
          {categoryStats.map((stat) => (
            <View key={stat.name} className={styles.statCard}>
              <Text className={styles.statIcon}>{stat.icon}</Text>
              <Text className={styles.statLabel}>{stat.name}</Text>
              <Text className={styles.statAmount}>
                {formatCurrency(stat.total, selectedCurrency)}
              </Text>
            </View>
          ))}
        </View>

        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>消费记录</Text>
          <Text className={styles.listCount}>{expenses.length} 条</Text>
        </View>

        <View className={styles.expenseList}>
          {sortedExpenses.length > 0 ? (
            sortedExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={{
                  ...expense,
                  amount: convertCurrency(expense.amount, expense.currency, selectedCurrency),
                  currency: selectedCurrency
                }}
                onDelete={handleDeleteExpense}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>💰</Text>
              <Text className={styles.emptyTitle}>还没有消费记录</Text>
              <Text className={styles.emptyDesc}>
                点击右下角按钮，记录你的第一笔消费吧
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.fab} onClick={handleAddExpense}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default ExpensePage
