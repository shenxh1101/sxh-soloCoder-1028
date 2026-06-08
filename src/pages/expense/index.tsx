import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
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
    displayCurrency,
    setDisplayCurrency,
    removeExpense
  } = useTravelStore()

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, displayCurrency), 0)
  }, [expenses, displayCurrency])

  const convertedBudget = useMemo(() => ({
    ...budget,
    total: convertCurrency(budget.total, budget.currency, displayCurrency),
    spent: totalSpent
  }), [budget, displayCurrency, totalSpent])

  const remaining = convertedBudget.total - convertedBudget.spent
  const progressPercent = Math.min((convertedBudget.spent / convertedBudget.total) * 100, 100)
  const isOverBudget = remaining < 0

  const categoryStats = useMemo((): CategoryStat[] => {
    const stats: Record<string, CategoryStat> = {
      交通: { name: '交通', icon: '🚄', total: 0 },
      住宿: { name: '住宿', icon: '🏨', total: 0 },
      餐饮: { name: '餐饮', icon: '🍜', total: 0 },
      门票: { name: '门票', icon: '🎫', total: 0 },
      购物: { name: '购物', icon: '🛍️', total: 0 },
      其他: { name: '其他', icon: '💰', total: 0 }
    }

    expenses.forEach((exp) => {
      const category = stats[exp.category] ? exp.category : '其他'
      const converted = convertCurrency(exp.amount, exp.currency, displayCurrency)
      stats[category].total += converted
    })

    return Object.values(stats).filter((s) => s.total > 0)
  }, [expenses, displayCurrency])

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses])

  const perPersonAmount = useMemo(() => {
    if (expenses.length === 0) return 0
    const allSplit = expenses.flatMap((e) => e.splitAmong)
    const uniquePeople = [...new Set(allSplit)]
    if (uniquePeople.length === 0) return 0
    const totalInDisplay = expenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, displayCurrency), 0)
    return totalInDisplay / uniquePeople.length
  }, [expenses, displayCurrency])

  const handleCurrencyChange = (currency: Currency) => {
    console.log('[ExpensePage] Currency changed:', currency)
    setDisplayCurrency(currency)
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
                {formatCurrency(convertedBudget.spent, displayCurrency)}
              </Text>
            </View>
            <View className={styles.budgetSection}>
              <Text className={styles.budgetLabel}>总预算</Text>
              <Text className={styles.budgetAmount}>
                {formatCurrency(convertedBudget.total, displayCurrency)}
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
              {formatCurrency(Math.abs(remaining), displayCurrency)}
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

          {perPersonAmount > 0 && (
            <View className={styles.perPersonSection}>
              <Text className={styles.perPersonLabel}>人均分摊</Text>
              <Text className={styles.perPersonAmount}>
                {formatCurrency(perPersonAmount, displayCurrency)}
              </Text>
            </View>
          )}
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
              displayCurrency === currency && styles.active
            )}
            onClick={() => handleCurrencyChange(currency)}
          >
            <Text className={styles.currencyText}>
              {currency} · {currencyNames[currency]}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY>
        <View className={styles.statsGrid}>
          {categoryStats.map((stat) => (
            <View key={stat.name} className={styles.statCard}>
              <Text className={styles.statIcon}>{stat.icon}</Text>
              <Text className={styles.statLabel}>{stat.name}</Text>
              <Text className={styles.statAmount}>
                {formatCurrency(stat.total, displayCurrency)}
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
                  amount: convertCurrency(expense.amount, expense.currency, displayCurrency),
                  currency: displayCurrency
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
