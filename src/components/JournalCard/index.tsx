import React from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import styles from './index.module.scss'
import type { JournalEntry } from '@/types/travel'

interface JournalCardProps {
  journal: JournalEntry
  onDelete?: (id: string) => void
}

const JournalCard: React.FC<JournalCardProps> = ({ journal, onDelete }) => {
  const handleClick = () => {
    console.log('[JournalCard] Clicked:', journal.title)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('[JournalCard] Delete:', journal.id)
    if (onDelete) {
      onDelete(journal.id)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text
        key={i}
        className={i < rating ? styles.starFilled : styles.starEmpty}
      >
        ★
      </Text>
    ))
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      {journal.images.length > 0 && (
        <ScrollView className={styles.imageScroll} scrollX enableFlex>
          {journal.images.map((img, index) => (
            <Image
              key={index}
              className={styles.image}
              src={img}
              mode='aspectFill'
              onError={(e) => console.error('[JournalCard] Image load error:', e)}
            />
          ))}
        </ScrollView>
      )}
      <View className={styles.content}>
        <View className={styles.header}>
          <View className={styles.dateSection}>
            <Text className={styles.date}>{journal.date}</Text>
            {journal.weather && (
              <Text className={styles.weather}>{journal.weather}</Text>
            )}
            {journal.mood && (
              <Text className={styles.mood}>· {journal.mood}</Text>
            )}
          </View>
          <View
            className={styles.deleteBtn}
            onClick={handleDelete}
          >
            <Text className={styles.deleteText}>删除</Text>
          </View>
        </View>
        <Text className={styles.title}>{journal.title}</Text>
        <Text className={styles.contentText}>{journal.content}</Text>
        <View className={styles.footer}>
          {journal.location && (
            <View className={styles.location}>
              <Text className={styles.locationIcon}>📍</Text>
              <Text className={styles.locationText}>{journal.location}</Text>
            </View>
          )}
          <View className={styles.rating}>
            {renderStars(journal.rating)}
          </View>
        </View>
      </View>
    </View>
  )
}

export default JournalCard
