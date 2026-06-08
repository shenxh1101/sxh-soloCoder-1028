import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Place } from '@/types/travel'

interface PlaceCardProps {
  place: Place
  onDelete?: (id: string) => void
}

const categoryConfig = {
  attraction: { label: '景点', color: '#ff9500' },
  hotel: { label: '酒店', color: '#5856d6' },
  restaurant: { label: '餐厅', color: '#ff2d55' },
  transport: { label: '交通', color: '#34c759' }
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onDelete }) => {
  const handleClick = () => {
    console.log('[PlaceCard] Clicked place:', place.name)
    Taro.navigateTo({
      url: '/pages/place-detail/index?id=' + place.id
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('[PlaceCard] Delete place:', place.id)
    if (onDelete) {
      onDelete(place.id)
    }
  }

  const config = categoryConfig[place.category]

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image
        className={styles.image}
        src={place.image}
        mode='aspectFill'
        onError={(e) => console.error('[PlaceCard] Image load error:', e)}
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{place.name}</Text>
          <View
            className={styles.deleteBtn}
            onClick={handleDelete}
          >
            <Text className={styles.deleteText}>删除</Text>
          </View>
        </View>
        <View className={styles.tags}>
          <View
            className={styles.categoryTag}
            style={{ backgroundColor: config.color + '15', color: config.color }}
          >
            <Text>{config.label}</Text>
          </View>
          {place.rating && (
            <View className={styles.ratingTag}>
              <Text className={styles.star}>★</Text>
              <Text className={styles.ratingText}>{place.rating}</Text>
            </View>
          )}
        </View>
        <Text className={styles.address}>{place.address}</Text>
        <Text className={styles.description}>{place.description}</Text>
      </View>
    </View>
  )
}

export default PlaceCard
