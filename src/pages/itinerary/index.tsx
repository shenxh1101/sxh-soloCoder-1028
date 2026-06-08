import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import { mockItineraries } from '@/data/mockItineraries'
import ItineraryCard from '@/components/ItineraryCard'
import type { TimeSlot, ItineraryItem } from '@/types/travel'

interface TimeSlotConfig {
  key: TimeSlot
  label: string
  icon: string
}

const timeSlots: TimeSlotConfig[] = [
  { key: 'morning', label: '上午', icon: '🌅' },
  { key: 'afternoon', label: '下午', icon: '☀️' },
  { key: 'evening', label: '晚上', icon: '🌙' }
]

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const ItineraryPage: React.FC = () => {
  const {
    itinerary,
    selectedDate,
    setSelectedDate,
    addItineraryItem,
    removeItineraryItem,
    checkConflicts
  } = useTravelStore()

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized && itinerary.length === 0) {
      console.log('[ItineraryPage] Initializing with mock data')
      mockItineraries.forEach((item) => {
        addItineraryItem({
          title: item.title,
          description: item.description,
          date: item.date,
          timeSlot: item.timeSlot,
          startTime: item.startTime,
          endTime: item.endTime,
          location: item.location,
          placeId: item.placeId,
          order: item.order
        })
      })
      setIsInitialized(true)
    }
  }, [isInitialized, itinerary.length, addItineraryItem])

  useEffect(() => {
    if (selectedDate) {
      checkConflicts(selectedDate)
    }
  }, [selectedDate, checkConflicts])

  const currentDateObj = useMemo(() => dayjs(selectedDate), [selectedDate])
  const hasConflict = useMemo(
    () => itinerary.some((i) => i.date === selectedDate && i.hasConflict),
    [itinerary, selectedDate]
  )

  const getSlotItems = (slot: TimeSlot): ItineraryItem[] => {
    return itinerary
      .filter((i) => i.date === selectedDate && i.timeSlot === slot)
      .sort((a, b) => a.order - b.order || a.startTime.localeCompare(b.startTime))
  }

  const handlePrevDate = () => {
    const newDate = currentDateObj.subtract(1, 'day').format('YYYY-MM-DD')
    console.log('[ItineraryPage] Previous date:', newDate)
    setSelectedDate(newDate)
  }

  const handleNextDate = () => {
    const newDate = currentDateObj.add(1, 'day').format('YYYY-MM-DD')
    console.log('[ItineraryPage] Next date:', newDate)
    setSelectedDate(newDate)
  }

  const handleAddItinerary = () => {
    console.log('[ItineraryPage] Add itinerary clicked')
    Taro.showActionSheet({
      itemList: ['添加上午行程', '添加下午行程', '添加晚上行程'],
      success: (res) => {
        const slots: TimeSlot[] = ['morning', 'afternoon', 'evening']
        const selectedSlot = slots[res.tapIndex]
        Taro.showModal({
          title: '添加行程',
          editable: true,
          placeholderText: '请输入行程名称',
          success: (modalRes) => {
            if (modalRes.confirm && modalRes.content) {
              const timeRanges = {
                morning: { start: '09:00', end: '12:00' },
                afternoon: { start: '14:00', end: '17:00' },
                evening: { start: '19:00', end: '21:00' }
              }
              const range = timeRanges[selectedSlot]
              const slotItems = getSlotItems(selectedSlot)
              addItineraryItem({
                title: modalRes.content,
                date: selectedDate,
                timeSlot: selectedSlot,
                startTime: range.start,
                endTime: range.end,
                order: slotItems.length
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

  const handleDeleteItinerary = (id: string) => {
    console.log('[ItineraryPage] Delete itinerary:', id)
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个行程吗？',
      success: (res) => {
        if (res.confirm) {
          removeItineraryItem(id)
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
        <Text className={styles.pageTitle}>行程安排</Text>
        <View className={styles.dateSelector}>
          <View className={styles.dateNav} onClick={handlePrevDate}>
            <Text className={styles.dateNavIcon}>‹</Text>
          </View>
          <View className={styles.dateDisplay}>
            <Text className={styles.currentDate}>
              {currentDateObj.format('MM月DD日')}
            </Text>
            <Text className={styles.weekday}>
              {weekdayNames[currentDateObj.day()]}
            </Text>
          </View>
          <View className={styles.dateNav} onClick={handleNextDate}>
            <Text className={styles.dateNavIcon}>›</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className={styles.timelineContainer}
        scrollY
        refresherEnabled
        onRefresherRefresh={() => {
          console.log('[ItineraryPage] Pull to refresh')
          setTimeout(() => {
            Taro.stopPullDownRefresh()
          }, 1000)
        }}
      >
        {hasConflict && (
          <View className={styles.conflictBanner}>
            <Text className={styles.conflictIcon}>⚠️</Text>
            <Text className={styles.conflictText}>检测到时间冲突，请调整行程安排</Text>
          </View>
        )}

        {timeSlots.map((slot) => {
          const items = getSlotItems(slot.key)
          return (
            <View key={slot.key} className={styles.timeSection}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionIcon}>{slot.icon}</Text>
                <Text className={styles.sectionTitle}>{slot.label}</Text>
                <Text className={styles.sectionCount}>{items.length} 项</Text>
              </View>

              {items.length > 0 ? (
                items.map((item) => (
                  <ItineraryCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItinerary}
                  />
                ))
              ) : (
                <View className={styles.emptySlot}>
                  <Text className={styles.emptySlotText}>
                    暂无{slot.label}行程，点击右下角按钮添加
                  </Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      <View className={styles.fab} onClick={handleAddItinerary}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default ItineraryPage
