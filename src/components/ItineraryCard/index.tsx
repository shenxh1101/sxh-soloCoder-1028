import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { ItineraryItem } from '@/types/travel'

interface ItineraryCardProps {
  item: ItineraryItem
  onDelete?: (id: string) => void
  onEdit?: () => void
  onLongPress?: () => void
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ item, onDelete, onEdit, onLongPress }) => {
  const handleClick = () => {
    if (onEdit) {
      onEdit()
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(item.id)
    }
  }

  return (
    <View
      className={classnames(styles.card, item.hasConflict && styles.conflict)}
      onClick={handleClick}
      onLongPress={onLongPress}
    >
      <View className={styles.timeSection}>
        <Text className={styles.time}>{item.startTime}</Text>
        <View className={styles.timeLine} />
        <Text className={styles.time}>{item.endTime}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{item.title}</Text>
          <View className={styles.deleteBtn} onClick={handleDelete}>
            <Text className={styles.deleteText}>删除</Text>
          </View>
        </View>
        {item.description && (
          <Text className={styles.description}>{item.description}</Text>
        )}
        {item.location && (
          <View className={styles.location}>
            <Text className={styles.locationIcon}>📍</Text>
            <Text className={styles.locationText}>{item.location}</Text>
          </View>
        )}
        {item.hasConflict && (
          <View className={styles.conflictWarning}>
            <Text className={styles.warningIcon}>⚠️</Text>
            <Text className={styles.warningText}>时间冲突</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ItineraryCard
