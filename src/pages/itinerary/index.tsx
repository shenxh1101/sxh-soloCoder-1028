import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
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

interface FormData {
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  timeSlot: TimeSlot
}

const defaultTimeRanges = {
  morning: { start: '09:00', end: '12:00' },
  afternoon: { start: '14:00', end: '17:00' },
  evening: { start: '19:00', end: '21:00' }
}

const ItineraryPage: React.FC = () => {
  const {
    itinerary,
    selectedDate,
    setSelectedDate,
    addItineraryItem,
    removeItineraryItem,
    updateItineraryItem,
    reorderItinerary,
    checkConflicts
  } = useTravelStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showOverview, setShowOverview] = useState(true)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    startTime: '09:00',
    endTime: '12:00',
    timeSlot: 'morning'
  })

  interface DayOverview {
    date: string
    count: number
    hasConflict: boolean
    startTime: string
    endTime: string
  }

  React.useEffect(() => {
    if (selectedDate) {
      checkConflicts(selectedDate)
    }
  }, [selectedDate, checkConflicts])

  const dayOverviews = useMemo((): DayOverview[] => {
    const dateMap = new Map<string, DayOverview>()

    itinerary.forEach((item) => {
      const existing = dateMap.get(item.date)
      if (existing) {
        existing.count++
        if (item.hasConflict) existing.hasConflict = true
        if (item.startTime < existing.startTime) existing.startTime = item.startTime
        if (item.endTime > existing.endTime) existing.endTime = item.endTime
      } else {
        dateMap.set(item.date, {
          date: item.date,
          count: 1,
          hasConflict: item.hasConflict || false,
          startTime: item.startTime,
          endTime: item.endTime
        })
      }
    })

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [itinerary])

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
    setSelectedDate(newDate)
  }

  const handleNextDate = () => {
    const newDate = currentDateObj.add(1, 'day').format('YYYY-MM-DD')
    setSelectedDate(newDate)
  }

  const handleOpenAddModal = (slot?: TimeSlot) => {
    const selectedSlot = slot || 'morning'
    const range = defaultTimeRanges[selectedSlot]
    setFormData({
      title: '',
      description: '',
      location: '',
      startTime: range.start,
      endTime: range.end,
      timeSlot: selectedSlot
    })
    setEditingItem(null)
    setShowAddModal(true)
  }

  const handleOpenEditModal = (item: ItineraryItem) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      location: item.location || '',
      startTime: item.startTime,
      endTime: item.endTime,
      timeSlot: item.timeSlot
    })
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入行程名称', icon: 'none' })
      return
    }
    if (!formData.startTime || !formData.endTime) {
      Taro.showToast({ title: '请填写时间', icon: 'none' })
      return
    }
    if (formData.startTime >= formData.endTime) {
      Taro.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })
      return
    }

    const slotItems = getSlotItems(formData.timeSlot)

    if (editingItem) {
      updateItineraryItem(editingItem.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        timeSlot: formData.timeSlot
      })
      Taro.showToast({ title: '更新成功', icon: 'success' })
    } else {
      addItineraryItem({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: selectedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        timeSlot: formData.timeSlot,
        order: slotItems.length
      })
      Taro.showToast({ title: '添加成功', icon: 'success' })
    }

    setShowAddModal(false)
  }

  const handleDeleteItinerary = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个行程吗？',
      success: (res) => {
        if (res.confirm) {
          removeItineraryItem(id)
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  const handleMoveUp = (item: ItineraryItem) => {
    const items = getSlotItems(item.timeSlot)
    const index = items.findIndex((i) => i.id === item.id)
    if (index <= 0) return

    const newItems = [...items]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    newItems.forEach((i, idx) => {
      i.order = idx
    })

    reorderItinerary(selectedDate, item.timeSlot, newItems)
    Taro.vibrateShort()
  }

  const handleMoveDown = (item: ItineraryItem) => {
    const items = getSlotItems(item.timeSlot)
    const index = items.findIndex((i) => i.id === item.id)
    if (index < 0 || index >= items.length - 1) return

    const newItems = [...items]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    newItems.forEach((i, idx) => {
      i.order = idx
    })

    reorderItinerary(selectedDate, item.timeSlot, newItems)
    Taro.vibrateShort()
  }

  const handleLongPress = (item: ItineraryItem) => {
    setDraggedItem(draggedItem === item.id ? null : item.id)
    Taro.vibrateShort()
  }

  const handleTimeSlotChange = (slot: TimeSlot) => {
    const range = defaultTimeRanges[slot]
    setFormData((prev) => ({
      ...prev,
      timeSlot: slot,
      startTime: range.start,
      endTime: range.end
    }))
  }

  const updateForm = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
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

      <ScrollView className={styles.timelineContainer} scrollY>
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
                <View
                  className={styles.addSlotBtn}
                  onClick={() => handleOpenAddModal(slot.key)}
                >
                  <Text className={styles.addSlotBtnIcon}>+</Text>
                </View>
              </View>

              {items.length > 0 ? (
                items.map((item) => (
                  <View key={item.id} className={styles.cardWrapper}>
                    <ItineraryCard
                      item={item}
                      onDelete={handleDeleteItinerary}
                      onEdit={() => handleOpenEditModal(item)}
                      onLongPress={() => handleLongPress(item)}
                    />
                    {draggedItem === item.id && (
                      <View className={styles.reorderControls}>
                        <View
                          className={classnames(
                            styles.reorderBtn,
                            items.findIndex((i) => i.id === item.id) === 0 && styles.reorderBtnDisabled
                          )}
                          onClick={() => handleMoveUp(item)}
                        >
                          <Text className={styles.reorderBtnIcon}>↑</Text>
                          <Text className={styles.reorderBtnText}>上移</Text>
                        </View>
                        <View
                          className={classnames(
                            styles.reorderBtn,
                            items.findIndex((i) => i.id === item.id) === items.length - 1 && styles.reorderBtnDisabled
                          )}
                          onClick={() => handleMoveDown(item)}
                        >
                          <Text className={styles.reorderBtnIcon}>↓</Text>
                          <Text className={styles.reorderBtnText}>下移</Text>
                        </View>
                        <View
                          className={styles.reorderBtnCancel}
                          onClick={() => setDraggedItem(null)}
                        >
                          <Text className={styles.reorderBtnText}>完成</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View className={styles.emptySlot}>
                  <Text className={styles.emptySlotText}>
                    暂无{slot.label}行程，点击右侧 + 添加
                  </Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      <View className={styles.fab} onClick={() => handleOpenAddModal()}>
        <Text className={styles.fabIcon}>+</Text>
      </View>

      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {editingItem ? '编辑行程' : '添加行程'}
              </Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>×</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              <View className={styles.formSection}>
                <Text className={styles.formLabel}>时段</Text>
                <View className={styles.slotSelector}>
                  {timeSlots.map((slot) => (
                    <View
                      key={slot.key}
                      className={classnames(
                        styles.slotOption,
                        formData.timeSlot === slot.key && styles.slotOptionActive
                      )}
                      onClick={() => handleTimeSlotChange(slot.key)}
                    >
                      <Text className={styles.slotOptionIcon}>{slot.icon}</Text>
                      <Text className={styles.slotOptionText}>{slot.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>行程名称 <Text className={styles.required}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder='例如：游览故宫博物院'
                  value={formData.title}
                  onInput={(e) => updateForm('title', e.detail.value)}
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formItemHalf}>
                  <Text className={styles.formLabel}>开始时间 <Text className={styles.required}>*</Text></Text>
                  <Input
                    className={styles.formInput}
                    placeholder='09:00'
                    value={formData.startTime}
                    onInput={(e) => updateForm('startTime', e.detail.value)}
                  />
                </View>
                <View className={styles.formItemHalf}>
                  <Text className={styles.formLabel}>结束时间 <Text className={styles.required}>*</Text></Text>
                  <Input
                    className={styles.formInput}
                    placeholder='12:00'
                    value={formData.endTime}
                    onInput={(e) => updateForm('endTime', e.detail.value)}
                  />
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>地点</Text>
                <Input
                  className={styles.formInput}
                  placeholder='例如：北京市东城区景山前街4号'
                  value={formData.location}
                  onInput={(e) => updateForm('location', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>备注</Text>
                <Input
                  className={styles.formInput}
                  placeholder='行程备注说明...'
                  value={formData.description}
                  onInput={(e) => updateForm('description', e.detail.value)}
                />
              </View>

              <View className={styles.timeHint}>
                <Text className={styles.timeHintText}>
                  💡 提示：同一时段内如果时间重叠，系统会自动检测并标记冲突
                </Text>
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <View className={styles.btnCancel} onClick={() => setShowAddModal(false)}>
                <Text className={styles.btnCancelText}>取消</Text>
              </View>
              <View className={styles.btnSubmit} onClick={handleSubmit}>
                <Text className={styles.btnSubmitText}>
                  {editingItem ? '更新' : '保存'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ItineraryPage
