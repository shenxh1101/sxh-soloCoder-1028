import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { ChecklistItem as ChecklistItemType } from '@/types/travel'

interface ChecklistItemProps {
  item: ChecklistItemType
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
}

const categoryColors: Record<string, string> = {
  documents: '#ff9500',
  clothing: '#5856d6',
  medicine: '#ff2d55',
  electronics: '#34c759',
  other: '#86909c'
}

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({
  item,
  onToggle,
  onDelete
}) => {
  const handleToggle = () => {
    console.log('[ChecklistItem] Toggle:', item.id, !item.checked)
    onToggle(item.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('[ChecklistItem] Delete:', item.id)
    if (onDelete) {
      onDelete(item.id)
    }
  }

  return (
    <View
      className={classnames(styles.item, item.checked && styles.checked)}
      onClick={handleToggle}
    >
      <View
        className={styles.checkbox}
        style={{ borderColor: item.checked ? categoryColors[item.category] : '#d0d0d0' }}
      >
        {item.checked && <Text className={styles.checkmark}>✓</Text>}
      </View>
      <View className={styles.content}>
        <View className={styles.mainInfo}>
          <Text className={styles.name}>{item.name}</Text>
          {item.quantity && item.quantity > 1 && (
            <View className={styles.quantity}>
              <Text className={styles.quantityText}>×{item.quantity}</Text>
            </View>
          )}
        </View>
        {item.note && (
          <Text className={styles.note}>{item.note}</Text>
        )}
      </View>
      <View className={styles.deleteBtn} onClick={handleDelete}>
        <Text className={styles.deleteText}>删除</Text>
      </View>
    </View>
  )
}

export default ChecklistItemComponent
