import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import ChecklistItemComponent from '@/components/ChecklistItem'
import type { ChecklistCategory } from '@/types/travel'

interface CategoryConfig {
  key: ChecklistCategory
  name: string
  icon: string
  color: string
}

const categories: CategoryConfig[] = [
  { key: 'documents', name: '证件', icon: '📄', color: '#ff9500' },
  { key: 'clothing', name: '衣物', icon: '👕', color: '#5856d6' },
  { key: 'medicine', name: '药品', icon: '💊', color: '#ff2d55' },
  { key: 'electronics', name: '电子设备', icon: '📱', color: '#34c759' },
  { key: 'other', name: '其他', icon: '📦', color: '#86909c' }
]

const ChecklistPage: React.FC = () => {
  const {
    checklist,
    addChecklistItem,
    removeChecklistItem,
    toggleChecklistItem
  } = useTravelStore()

  const [selectedCategory, setSelectedCategory] = useState<ChecklistCategory | 'all'>('all')

  const overallProgress = useMemo(() => {
    if (checklist.length === 0) return { checked: 0, total: 0, percent: 0 }
    const checked = checklist.filter((i) => i.checked).length
    const total = checklist.length
    return { checked, total, percent: Math.round((checked / total) * 100) }
  }, [checklist])

  const categoryStats = useMemo(() => {
    const stats: Record<string, { checked: number; total: number }> = {}
    categories.forEach((cat) => {
      const items = checklist.filter((i) => i.category === cat.key)
      stats[cat.key] = {
        checked: items.filter((i) => i.checked).length,
        total: items.length
      }
    })
    return stats
  }, [checklist])

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return checklist
    return checklist.filter((i) => i.category === selectedCategory)
  }, [checklist, selectedCategory])

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {}
    categories.forEach((cat) => {
      groups[cat.key] = filteredItems.filter((i) => i.category === cat.key)
    })
    return groups
  }, [filteredItems])

  const getProgressTip = () => {
    const { percent } = overallProgress
    if (percent === 0) return '开始准备吧！'
    if (percent < 30) return '加油，准备工作刚开始'
    if (percent < 60) return '进度不错，继续保持'
    if (percent < 100) return '快完成了，再检查一下'
    return '太棒了！准备就绪，可以出发啦 🎉'
  }

  const handleCategoryClick = (category: ChecklistCategory | 'all') => {
    console.log('[ChecklistPage] Category clicked:', category)
    setSelectedCategory(category)
  }

  const handleAddItem = () => {
    console.log('[ChecklistPage] Add item clicked')
    Taro.showActionSheet({
      itemList: categories.map((c) => `${c.icon} 添加到${c.name}`),
      success: (res) => {
        const category = categories[res.tapIndex].key
        Taro.showModal({
          title: '添加物品',
          editable: true,
          placeholderText: '请输入物品名称',
          success: (modalRes) => {
            if (modalRes.confirm && modalRes.content) {
              addChecklistItem({
                name: modalRes.content,
                category,
                checked: false
              })
              Taro.showToast({
                title: '添加成功',
                icon: 'success'
              })
            }
          }
        })
      }
    })
  }

  const handleDeleteItem = (id: string) => {
    console.log('[ChecklistPage] Delete item:', id)
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个物品吗？',
      success: (res) => {
        if (res.confirm) {
          removeChecklistItem(id)
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }

  const allCategories = [
    { key: 'all' as const, name: '全部', icon: '📋', color: '#ff7a45' },
    ...categories
  ]

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>打包清单</Text>

        <View className={styles.progressSection}>
          <View
            className={styles.progressRing}
            style={{ ['--progress' as any]: overallProgress.percent }}
          >
            <View className={styles.ringBg}>
              <View className={styles.ringInner}>
                <Text className={styles.ringText}>{overallProgress.percent}%</Text>
              </View>
            </View>
          </View>
          <View className={styles.progressInfo}>
            <Text className={styles.progressTitle}>打包进度</Text>
            <Text className={styles.progressStats}>
              已完成 {overallProgress.checked} / {overallProgress.total} 项
            </Text>
            <Text className={styles.progressTip}>{getProgressTip()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className={styles.categoryTabs}
        scrollX
        showScrollbar={false}
      >
        {allCategories.map((cat) => {
          const stats = cat.key === 'all'
            ? overallProgress
            : categoryStats[cat.key]
          return (
            <View
              key={cat.key}
              className={classnames(
                styles.categoryTab,
                selectedCategory === cat.key && styles.active
              )}
              onClick={() => handleCategoryClick(cat.key)}
            >
              <Text className={styles.catIcon}>{cat.icon}</Text>
              <Text className={styles.catName}>{cat.name}</Text>
              <Text className={styles.catCount}>
                {stats.checked}/{stats.total}
              </Text>
            </View>
          )
        })}
      </ScrollView>

      <ScrollView
        className={styles.checklistContainer}
        scrollY
        refresherEnabled
        onRefresherRefresh={() => {
          console.log('[ChecklistPage] Pull to refresh')
          setTimeout(() => {
            Taro.stopPullDownRefresh()
          }, 1000)
        }}
      >
        {selectedCategory === 'all' ? (
          categories.map((cat) => {
            const items = groupedItems[cat.key]
            if (items.length === 0) return null
            const stat = categoryStats[cat.key]
            return (
              <View key={cat.key}>
                <View className={styles.categoryHeader}>
                  <View className={styles.categoryTitle}>
                    <Text>{cat.icon}</Text>
                    <Text className={styles.categoryName}>{cat.name}</Text>
                  </View>
                  <Text className={styles.categoryProgress}>
                    {stat.checked}/{stat.total} 已打包
                  </Text>
                </View>
                {items.map((item) => (
                  <ChecklistItemComponent
                    key={item.id}
                    item={item}
                    onToggle={toggleChecklistItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </View>
            )
          })
        ) : (
          (() => {
            const cat = categories.find((c) => c.key === selectedCategory)!
            const items = groupedItems[selectedCategory]
            const stat = categoryStats[selectedCategory]
            return (
              <View>
                <View className={styles.categoryHeader}>
                  <View className={styles.categoryTitle}>
                    <Text>{cat.icon}</Text>
                    <Text className={styles.categoryName}>{cat.name}</Text>
                  </View>
                  <Text className={styles.categoryProgress}>
                    {stat.checked}/{stat.total} 已打包
                  </Text>
                </View>
                {items.length > 0 ? (
                  items.map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onToggle={toggleChecklistItem}
                      onDelete={handleDeleteItem}
                    />
                  ))
                ) : (
                  <View className={styles.emptyCategory}>
                    <Text className={styles.emptyCategoryText}>
                      该分类暂无物品，点击右下角按钮添加
                    </Text>
                  </View>
                )}
              </View>
            )
          })()
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleAddItem}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default ChecklistPage
