import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import type { Expense } from '@/types/travel'
import { formatCurrency } from '@/utils/currency'

interface ExpenseCardProps {
  expense: Expense
  onDelete?: (id: string) => void
}

const categoryIcons: Record<string, string> = {
  交通: '🚄',
  住宿: '🏨',
  餐饮: '🍜',
  门票: '🎫',
  购物: '🛍️',
  其他: '💰'
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('[ExpenseCard] Delete:', expense.id)
    if (onDelete) {
      onDelete(expense.id)
    }
  }

  const perPerson = expense.splitAmong.length > 0
    ? Number((expense.amount / expense.splitAmong.length).toFixed(2))
    : expense.amount

  return (
    <View className={styles.card}>
      <View className={styles.icon}>
        <Text>{categoryIcons[expense.category] || '💰'}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.description}>{expense.description}</Text>
          <Text className={styles.amount}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
        </View>
        <View className={styles.meta}>
          <View className={styles.metaItem}>
            <Text className={styles.label}>分类：</Text>
            <Text className={styles.value}>{expense.category}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.label}>日期：</Text>
            <Text className={styles.value}>{expense.date}</Text>
          </View>
        </View>
        <View className={styles.splitInfo}>
          <View className={styles.splitSection}>
            <Text className={styles.label}>支付：</Text>
            <Text className={styles.paidBy}>{expense.paidBy}</Text>
          </View>
          <View className={styles.splitSection}>
            <Text className={styles.label}>分摊：</Text>
            <Text className={styles.splitAmong}>
              {expense.splitAmong.join('、')}
            </Text>
            <Text className={styles.perPerson}>
              ({formatCurrency(perPerson, expense.currency)}/人)
            </Text>
          </View>
        </View>
      </View>
      <View className={styles.deleteBtn} onClick={handleDelete}>
        <Text className={styles.deleteText}>删除</Text>
      </View>
    </View>
  )
}

export default ExpenseCard
