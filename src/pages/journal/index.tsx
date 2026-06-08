import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import { mockJournals } from '@/data/mockJournals'
import JournalCard from '@/components/JournalCard'
import dayjs from 'dayjs'

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const JournalPage: React.FC = () => {
  const {
    journals,
    budget,
    addJournal,
    removeJournal
  } = useTravelStore()

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized && journals.length === 0) {
      console.log('[JournalPage] Initializing with mock data')
      mockJournals.forEach((journal) => {
        addJournal({
          date: journal.date,
          title: journal.title,
          content: journal.content,
          images: journal.images,
          location: journal.location,
          rating: journal.rating,
          latitude: journal.latitude,
          longitude: journal.longitude,
          weather: journal.weather,
          mood: journal.mood
        })
      })
      setIsInitialized(true)
    }
  }, [isInitialized, journals.length, addJournal])

  const stats = useMemo(() => {
    const uniqueDates = new Set(journals.map((j) => j.date)).size
    const totalDays = uniqueDates
    const avgRating = journals.length > 0
      ? (journals.reduce((sum, j) => sum + j.rating, 0) / journals.length)
      : 0
    const uniquePlaces = new Set(journals.map((j) => j.location)).size

    return {
      days: totalDays,
      entries: journals.length,
      avgRating: avgRating.toFixed(1),
      places: uniquePlaces,
      totalSpent: budget.spent
    }
  }, [journals, budget])

  const groupedJournals = useMemo(() => {
    const groups: Record<string, typeof journals> = {}
    journals.forEach((journal) => {
      if (!groups[journal.date]) {
        groups[journal.date] = []
      }
      groups[journal.date].push(journal)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [journals])

  const handleAddJournal = () => {
    console.log('[JournalPage] Add journal clicked')
    Taro.navigateTo({
      url: '/pages/add-journal/index'
    })
  }

  const handleGenerateSummary = () => {
    console.log('[JournalPage] Generate summary clicked')
    if (journals.length === 0) {
      Taro.showToast({
        title: '还没有旅途记录',
        icon: 'none'
      })
      return
    }
    Taro.navigateTo({
      url: '/pages/trip-summary/index'
    })
  }

  const handleDeleteJournal = (id: string) => {
    console.log('[JournalPage] Delete journal:', id)
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          removeJournal(id)
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
        <View className={styles.headerRow}>
          <Text className={styles.pageTitle}>旅途记录</Text>
          <Button
            className={styles.summaryBtn}
            onClick={handleGenerateSummary}
          >
            <Text className={styles.summaryBtnText}>生成总结</Text>
          </Button>
        </View>

        <View className={styles.statsCards}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.days}</Text>
            <Text className={styles.statLabel}>旅行天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.entries}</Text>
            <Text className={styles.statLabel}>记录数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.avgRating}</Text>
            <Text className={styles.statLabel}>平均评分</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.places}</Text>
            <Text className={styles.statLabel}>到访城市</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className={styles.timelineContainer}
        scrollY
        refresherEnabled
        onRefresherRefresh={() => {
          console.log('[JournalPage] Pull to refresh')
          setTimeout(() => {
            Taro.stopPullDownRefresh()
          }, 1000)
        }}
      >
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>旅行时光轴</Text>
          <Text className={styles.listCount}>{journals.length} 条记录</Text>
        </View>

        {groupedJournals.length > 0 ? (
          <View className={styles.timeline}>
            {groupedJournals.map(([date, dayJournals]) => {
              const dateObj = dayjs(date)
              return (
                <View key={date} className={styles.timelineItem}>
                  <View className={styles.dateHeader}>
                    <Text className={styles.dateText}>
                      {dateObj.format('MM月DD日')}
                    </Text>
                    <Text className={styles.weekdayText}>
                      {weekdayNames[dateObj.day()]}
                    </Text>
                  </View>
                  {dayJournals.map((journal) => (
                    <JournalCard
                      key={journal.id}
                      journal={journal}
                      onDelete={handleDeleteJournal}
                    />
                  ))}
                </View>
              )
            })}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📸</Text>
            <Text className={styles.emptyTitle}>还没有旅途记录</Text>
            <Text className={styles.emptyDesc}>
              点击右下角按钮，记录旅途中的美好瞬间吧
            </Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleAddJournal}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default JournalPage
