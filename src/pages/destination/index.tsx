import React, { useState, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import { mockDestinations } from '@/data/mockDestinations'
import PlaceCard from '@/components/PlaceCard'
import type { PlaceCategory } from '@/types/travel'

interface CategoryTab {
  key: PlaceCategory
  label: string
  icon: string
}

const categories: CategoryTab[] = [
  { key: 'attraction', label: '景点', icon: '🏛️' },
  { key: 'hotel', label: '酒店', icon: '🏨' },
  { key: 'restaurant', label: '餐厅', icon: '🍽️' },
  { key: 'transport', label: '交通', icon: '🚄' }
]

const DestinationPage: React.FC = () => {
  const {
    places,
    selectedPlaceCategory,
    setPlaceCategory,
    addPlace,
    removePlace
  } = useTravelStore()

  const [searchText, setSearchText] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized && places.length === 0) {
      console.log('[DestinationPage] Initializing with mock data')
      mockDestinations.forEach((place) => {
        addPlace({
          name: place.name,
          category: place.category,
          address: place.address,
          description: place.description,
          rating: place.rating,
          image: place.image,
          latitude: place.latitude,
          longitude: place.longitude
        })
      })
      setIsInitialized(true)
    }
  }, [isInitialized, places.length, addPlace])

  const filteredPlaces = places.filter((place) => {
    const matchCategory = place.category === selectedPlaceCategory
    const matchSearch = searchText === '' ||
      place.name.toLowerCase().includes(searchText.toLowerCase()) ||
      place.address.toLowerCase().includes(searchText.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleCategoryClick = (category: PlaceCategory) => {
    console.log('[DestinationPage] Category clicked:', category)
    setPlaceCategory(category)
  }

  const handleAddPlace = () => {
    console.log('[DestinationPage] Add place clicked')
    Taro.showToast({
      title: '添加功能开发中',
      icon: 'none'
    })
  }

  const handleDeletePlace = (id: string) => {
    console.log('[DestinationPage] Delete place:', id)
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个收藏的地点吗？',
      success: (res) => {
        if (res.confirm) {
          removePlace(id)
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
        <Text className={styles.pageTitle}>我的目的地</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索地点名称或地址'
            placeholderClass={styles.searchInput}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <ScrollView
        className={styles.categoryTabs}
        scrollX
        showScrollbar={false}
      >
        {categories.map((cat) => (
          <View
            key={cat.key}
            className={classnames(
              styles.tabItem,
              selectedPlaceCategory === cat.key && styles.active
            )}
            onClick={() => handleCategoryClick(cat.key)}
          >
            <Text className={styles.tabIcon}>{cat.icon}</Text>
            <Text className={styles.tabText}>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        className={styles.listContainer}
        scrollY
        refresherEnabled
        onRefresherRefresh={() => {
          console.log('[DestinationPage] Pull to refresh')
          setTimeout(() => {
            Taro.stopPullDownRefresh()
          }, 1000)
        }}
      >
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onDelete={handleDeletePlace}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📍</Text>
            <Text className={styles.emptyTitle}>还没有收藏的地点</Text>
            <Text className={styles.emptyDesc}>
              点击右下角按钮，收藏你想去的景点、酒店、餐厅和交通点吧
            </Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.fab} onClick={handleAddPlace}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default DestinationPage
