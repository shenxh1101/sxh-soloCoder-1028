import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import {
  formatCurrency,
  currencyNames,
  currencySymbols,
  getAvailableCurrencies
} from '@/utils/currency'
import type { Currency } from '@/types/travel'

const expenseCategories = [
  { key: '交通', icon: '🚄', color: '#4ECDC4' },
  { key: '住宿', icon: '🏨', color: '#5856D6' },
  { key: '餐饮', icon: '🍜', color: '#FF6B6B' },
  { key: '门票', icon: '🎫', color: '#FFB347' },
  { key: '购物', icon: '🛍️', color: '#FF85B3' },
  { key: '其他', icon: '💰', color: '#95E1D3' }
]

const defaultPeople = ['我', '同伴1', '同伴2', '同伴3']

interface FormData {
  amount: string
  currency: Currency
  category: string
  description: string
  date: string
  paidBy: string
  splitAmong: string[]
}

const AddExpensePage: React.FC = () => {
  const { addExpense, displayCurrency } = useTravelStore()

  const [formData, setFormData] = useState<FormData>({
    amount: '',
    currency: displayCurrency,
    category: '餐饮',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: '我',
    splitAmong: ['我']
  })

  const [customPerson, setCustomPerson] = useState('')
  const [showAllPeople, setShowAllPeople] = useState(false)

  const amountNum = parseFloat(formData.amount) || 0
  const splitCount = formData.splitAmong.length || 1
  const perPerson = amountNum / splitCount

  const allPeople = useMemo(() => {
    const all = [...new Set([...defaultPeople, ...formData.splitAmong, formData.paidBy])]
    return showAllPeople ? all : all.slice(0, 6)
  }, [formData.splitAmong, formData.paidBy, showAllPeople])

  const updateForm = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleTogglePerson = (person: string) => {
    setFormData((prev) => {
      const hasPerson = prev.splitAmong.includes(person)
      return {
        ...prev,
        splitAmong: hasPerson
          ? prev.splitAmong.filter((p) => p !== person)
          : [...prev.splitAmong, person]
      }
    })
  }

  const handleAddCustomPerson = () => {
    if (!customPerson.trim()) return
    const person = customPerson.trim()
    
    if (formData.splitAmong.includes(person)) {
      Taro.showToast({ title: '该成员已存在', icon: 'none' })
      setCustomPerson('')
      return
    }
    
    setFormData((prev) => ({
      ...prev,
      splitAmong: [...prev.splitAmong, person],
      paidBy: prev.paidBy || person
    }))
    setCustomPerson('')
    Taro.showToast({ title: `已添加 ${person}`, icon: 'success' })
  }

  const handleSelectAll = () => {
    updateForm('splitAmong', [...allPeople])
  }

  const handleClearAll = () => {
    updateForm('splitAmong', [])
  }

  const handleSubmit = () => {
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
    if (!formData.category) {
      Taro.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    if (!formData.paidBy) {
      Taro.showToast({ title: '请选择支付人', icon: 'none' })
      return
    }
    if (formData.splitAmong.length === 0) {
      Taro.showToast({ title: '请选择分摊人员', icon: 'none' })
      return
    }

    addExpense({
      amount,
      currency: formData.currency,
      category: formData.category,
      description: formData.description.trim() || formData.category,
      date: formData.date,
      paidBy: formData.paidBy,
      splitAmong: formData.splitAmong
    })

    Taro.showToast({ title: '添加成功', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
  }

  const selectedCategory = expenseCategories.find((c) => c.key === formData.category)

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollContainer}>
        <View className={styles.amountSection}>
          <View className={styles.amountRow}>
            <Text className={styles.currencySymbol}>
              {currencySymbols[formData.currency]}
            </Text>
            <Input
              className={styles.amountInput}
              type='digit'
              placeholder='0.00'
              placeholderClass={styles.amountPlaceholder}
              value={formData.amount}
              onInput={(e) => updateForm('amount', e.detail.value)}
            />
          </View>
          {amountNum > 0 && formData.splitAmong.length > 0 && (
            <Text className={styles.perPersonHint}>
              人均 {formatCurrency(perPerson, formData.currency)}
            </Text>
          )}
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>币种</Text>
          <ScrollView className={styles.currencyScroll} scrollX showScrollbar={false}>
            {getAvailableCurrencies().map((currency) => (
              <View
                key={currency}
                className={classnames(
                  styles.currencyOption,
                  formData.currency === currency && styles.currencyOptionActive
                )}
                onClick={() => updateForm('currency', currency)}
              >
                <Text className={styles.currencyOptionSymbol}>
                  {currencySymbols[currency]}
                </Text>
                <Text className={styles.currencyOptionText}>
                  {currency} {currencyNames[currency]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>消费分类</Text>
          <View className={styles.categoryGrid}>
            {expenseCategories.map((cat) => (
              <View
                key={cat.key}
                className={classnames(
                  styles.categoryOption,
                  formData.category === cat.key && styles.categoryOptionActive
                )}
                style={formData.category === cat.key ? { borderColor: cat.color, backgroundColor: `${cat.color}15` } : {}}
                onClick={() => updateForm('category', cat.key)}
              >
                <Text className={styles.categoryIcon}>{cat.icon}</Text>
                <Text className={styles.categoryText}>{cat.key}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>消费说明</Text>
          <Input
            className={styles.formInput}
            placeholder='例如：午餐、打车、门票等'
            value={formData.description}
            onInput={(e) => updateForm('description', e.detail.value)}
          />
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>日期</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='YYYY-MM-DD'
            value={formData.date}
            onInput={(e) => updateForm('date', e.detail.value)}
          />
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>支付人</Text>
          <ScrollView className={styles.peopleScroll} scrollX showScrollbar={false}>
            {allPeople.map((person) => (
              <View
                key={person}
                className={classnames(
                  styles.peopleOption,
                  formData.paidBy === person && styles.peopleOptionActive
                )}
                onClick={() => updateForm('paidBy', person)}
              >
                <Text className={styles.peopleText}>{person}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>分摊人员</Text>
            <View className={styles.sectionActions}>
              <Text className={styles.actionText} onClick={handleSelectAll}>全选</Text>
              <Text className={styles.actionDivider}>|</Text>
              <Text className={styles.actionText} onClick={handleClearAll}>清空</Text>
            </View>
          </View>
          <View className={styles.peopleGrid}>
            {allPeople.map((person) => (
              <View
                key={person}
                className={classnames(
                  styles.splitOption,
                  formData.splitAmong.includes(person) && styles.splitOptionActive
                )}
                onClick={() => handleTogglePerson(person)}
              >
                <Text className={styles.splitCheckbox}>
                  {formData.splitAmong.includes(person) ? '✓' : ''}
                </Text>
                <Text className={styles.splitText}>{person}</Text>
              </View>
            ))}
            <View
              className={classnames(
                styles.splitOption,
                styles.addPersonOption
              )}
              onClick={() => setShowAllPeople(!showAllPeople)}
            >
              <Text className={styles.splitAddIcon}>+</Text>
              <Text className={styles.splitText}>
                {showAllPeople ? '收起' : '更多'}
              </Text>
            </View>
          </View>
          <View className={styles.addPersonRow}>
            <Input
              className={styles.addPersonInput}
              placeholder='添加新成员'
              value={customPerson}
              onInput={(e) => setCustomPerson(e.detail.value)}
            />
            <View className={styles.addPersonBtn} onClick={handleAddCustomPerson}>
              <Text className={styles.addPersonBtnText}>添加</Text>
            </View>
          </View>
        </View>

        {formData.paidBy && formData.splitAmong.length > 0 && (
          <View className={styles.summaryCard}>
            <Text className={styles.summaryTitle}>分摊明细</Text>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>总金额</Text>
              <Text className={styles.summaryValue}>
                {formatCurrency(amountNum, formData.currency)}
              </Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>支付人</Text>
              <Text className={styles.summaryValue}>{formData.paidBy}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>分摊人数</Text>
              <Text className={styles.summaryValue}>{formData.splitAmong.length} 人</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>人均</Text>
              <Text className={styles.summaryValue} style={{ color: '$color-primary' }}>
                {formatCurrency(perPerson, formData.currency)}
              </Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>分摊人员</Text>
              <Text className={styles.summaryValuePeople}>
                {formData.splitAmong.join('、')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.btnCancel} onClick={() => Taro.navigateBack()}>
          <Text className={styles.btnCancelText}>取消</Text>
        </View>
        <View className={styles.btnSubmit} onClick={handleSubmit}>
          <Text className={styles.btnSubmitText}>保存</Text>
        </View>
      </View>
    </View>
  )
}

export default AddExpensePage
