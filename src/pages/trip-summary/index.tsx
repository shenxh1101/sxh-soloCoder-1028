import React, { useMemo } from 'react'
import { View, Text, ScrollView, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import { convertCurrency, formatCurrency } from '@/utils/currency'
import dayjs from 'dayjs'

const TripSummaryPage: React.FC = () => {
  const { journals, expenses, places, displayCurrency } = useTravelStore()

  const summary = useMemo(() => {
    if (journals.length === 0) {
      return {
        totalDays: 0,
        journalCount: 0,
        avgRating: 0,
        placesVisited: 0,
        totalSpent: 0,
        perPerson: 0,
        startDate: '',
        endDate: '',
        coverImage: '',
        title: '我的旅行'
      }
    }

    const allDates = journals.map((j) => j.date).sort()
    const startDate = allDates[0]
    const endDate = allDates[allDates.length - 1]
    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1

    const avgRating = journals.reduce((sum, j) => sum + j.rating, 0) / journals.length
    const uniquePlaces = new Set([
      ...journals.map((j) => j.location).filter(Boolean),
      ...places.map((p) => p.name)
    ]).size

    const totalSpent = expenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, displayCurrency), 0)

    const allPeople = new Set(expenses.flatMap((e) => e.splitAmong))
    const perPerson = allPeople.size > 0 ? totalSpent / allPeople.size : totalSpent

    const coverImage = journals.find((j) => j.images.length > 0)?.images[0]
      || places.find((p) => p.image)?.image
      || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'

    const title = `我的${dayjs(startDate).format('M月')}旅行`

    return {
      totalDays,
      journalCount: journals.length,
      avgRating,
      placesVisited: uniquePlaces,
      totalSpent,
      perPerson,
      startDate,
      endDate,
      coverImage,
      title
    }
  }, [journals, expenses, places, displayCurrency])

  const shareText = useMemo(() => {
    if (journals.length === 0) return ''

    const dateRange = dayjs(summary.startDate).format('M月D日') +
      (summary.endDate !== summary.startDate
        ? ` - ${dayjs(summary.endDate).format('M月D日')}`
        : '')

    const highlights = journals
      .map((j) => j.title)
      .slice(0, 3)
      .join('、')

    return `✨ ${summary.title}完美结束！
📅 ${dateRange}，共${summary.totalDays}天
📍 打卡${summary.placesVisited}个地点
📝 记录了${summary.journalCount}篇旅途笔记
⭐ 平均评分${summary.avgRating.toFixed(1)}分
💰 总花费${formatCurrency(summary.totalSpent, displayCurrency)}，人均${formatCurrency(summary.perPerson, displayCurrency)}
🎯 行程亮点：${highlights}
#旅行记录 #美好回忆`
  }, [summary, displayCurrency])

  const handleCopyShare = () => {
    Taro.setClipboardData({
      data: shareText,
      success: () => {
        Taro.showToast({ title: '已复制分享文案', icon: 'success' })
      }
    })
  }

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  if (journals.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyTitle}>还没有旅途记录</Text>
          <Text className={styles.emptyDesc}>先去记录一些旅途故事吧~</Text>
          <View className={styles.backBtn} onClick={handleBack}>
            <Text className={styles.backBtnText}>返回</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollContainer}>
        <View className={styles.coverSection}>
          <Image className={styles.coverImage} src={summary.coverImage} mode='aspectFill' />
          <View className={styles.coverOverlay} />
          <View className={styles.coverContent}>
            <Text className={styles.coverTitle}>{summary.title}</Text>
            <Text className={styles.coverDate}>
              {dayjs(summary.startDate).format('YYYY年M月D日')}
              {summary.endDate !== summary.startDate &&
                ` - ${dayjs(summary.endDate).format('M月D日')}`
              }
            </Text>
          </View>
        </View>

        <View className={styles.statsSection}>
          <View className={styles.statsGrid}>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{summary.totalDays}</Text>
              <Text className={styles.statLabel}>旅行天数</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{summary.journalCount}</Text>
              <Text className={styles.statLabel}>记录数</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{summary.placesVisited}</Text>
              <Text className={styles.statLabel}>到访地点</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{summary.avgRating.toFixed(1)}</Text>
              <Text className={styles.statLabel}>平均评分</Text>
            </View>
          </View>
        </View>

        <View className={styles.expenseSection}>
          <Text className={styles.sectionTitle}>💰 费用汇总</Text>
          <View className={styles.expenseCard}>
            <View className={styles.expenseRow}>
              <Text className={styles.expenseLabel}>总花费</Text>
              <Text className={styles.expenseValue}>
                {formatCurrency(summary.totalSpent, displayCurrency)}
              </Text>
            </View>
            <View className={styles.expenseRow}>
              <Text className={styles.expenseLabel}>人均分摊</Text>
              <Text className={styles.expenseValueHighlight}>
                {formatCurrency(summary.perPerson, displayCurrency)}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.highlightsSection}>
          <Text className={styles.sectionTitle}>📸 精彩瞬间</Text>
          <ScrollView className={styles.highlightsScroll} scrollX showScrollbar={false}>
            {journals.slice(0, 5).map((journal) => (
              <View key={journal.id} className={styles.highlightCard}>
                {journal.images.length > 0 ? (
                  <Image className={styles.highlightImage} src={journal.images[0]} mode='aspectFill' />
                ) : (
                  <View className={styles.highlightPlaceholder}>
                    <Text className={styles.highlightIcon}>📝</Text>
                  </View>
                )}
                <View className={styles.highlightContent}>
                  <Text className={styles.highlightTitle}>{journal.title}</Text>
                  <Text className={styles.highlightRating}>
                    {'★'.repeat(Math.round(journal.rating))}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.shareSection}>
          <View className={styles.shareHeader}>
            <Text className={styles.sectionTitle}>📤 分享文案</Text>
            <Text className={styles.copyBtn} onClick={handleCopyShare}>
              复制
            </Text>
          </View>
          <View className={styles.shareCard}>
            <Text className={styles.shareText} selectable>{shareText}</Text>
          </View>
        </View>

        <View className={styles.tagsSection}>
          {journals.flatMap((j) => [j.weather, j.mood]).filter(Boolean).slice(0, 8).map((tag, index) => (
            <View key={index} className={styles.tag}>
              <Text className={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.btnSecondary} onClick={handleBack}>
          <Text className={styles.btnSecondaryText}>返回</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleShare}>
          <Text className={styles.btnPrimaryText}>生成海报</Text>
        </View>
      </View>
    </View>
  )
}

export default TripSummaryPage
