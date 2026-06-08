import React, { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import PlaceCard from '@/components/PlaceCard'
import type { PlaceCategory, Place } from '@/types/travel'

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

const categoryColors: Record<PlaceCategory, string> = {
  attraction: '#FF6B6B',
  hotel: '#4ECDC4',
  restaurant: '#FFE66D',
  transport: '#95E1D3'
}

interface FormData {
  category: PlaceCategory
  name: string
  address: string
  description: string
  rating: string
  image: string
}

const initialFormData: FormData = {
  category: 'attraction',
  name: '',
  address: '',
  description: '',
  rating: '5',
  image: ''
}

const DestinationPage: React.FC = () => {
  const {
    places,
    selectedPlaceCategory,
    setPlaceCategory,
    addPlace,
    removePlace
  } = useTravelStore()

  const [searchText, setSearchText] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)

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
    setFormData({ ...initialFormData, category: selectedPlaceCategory })
    setShowModal(true)
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

  const handlePlaceClick = (place: Place) => {
    console.log('[DestinationPage] Place clicked:', place.id)
    Taro.navigateTo({
      url: `/pages/place-detail/index?id=${place.id}`
    })
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入名称', icon: 'none' })
      return
    }
    if (!formData.address.trim()) {
      Taro.showToast({ title: '请输入地址', icon: 'none' })
      return
    }

    const ratingNum = parseFloat(formData.rating)
    const newCategory = formData.category
    
    addPlace({
      category: newCategory,
      name: formData.name.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
      rating: isNaN(ratingNum) ? 5 : Math.min(5, Math.max(1, ratingNum)),
      image: formData.image.trim() || getDefaultImage(newCategory)
    })

    setPlaceCategory(newCategory)
    Taro.showToast({ title: '添加成功', icon: 'success' })
    setShowModal(false)
    setFormData(initialFormData)
  }

  const getDefaultImage = (category: PlaceCategory): string => {
    const images: Record<PlaceCategory, string> = {
      attraction: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      transport: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800'
    }
    return images[category]
  }

  const updateForm = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
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
      >
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onDelete={handleDeletePlace}
              onClick={() => handlePlaceClick(place)}
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

      {showModal && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加地点</Text>
              <Text className={styles.modalClose} onClick={() => setShowModal(false)}>×</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              <View className={styles.formSection}>
                <Text className={styles.formLabel}>选择分类</Text>
                <View className={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <View
                      key={cat.key}
                      className={classnames(
                        styles.categoryOption,
                        formData.category === cat.key && styles.categoryOptionActive
                      )}
                      style={formData.category === cat.key ? { borderColor: categoryColors[cat.key], backgroundColor: `${categoryColors[cat.key]}15` } : {}}
                      onClick={() => updateForm('category', cat.key)}
                    >
                      <Text className={styles.categoryOptionIcon}>{cat.icon}</Text>
                      <Text className={styles.categoryOptionText}>{cat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>名称 <Text className={styles.required}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder='例如：故宫博物院'
                  value={formData.name}
                  onInput={(e) => updateForm('name', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>地址 <Text className={styles.required}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder='例如：北京市东城区景山前街4号'
                  value={formData.address}
                  onInput={(e) => updateForm('address', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>简介</Text>
                <Input
                  className={styles.formInput}
                  placeholder='简单介绍一下这个地方...'
                  value={formData.description}
                  onInput={(e) => updateForm('description', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>评分 (1-5)</Text>
                <View className={styles.ratingInput}>
                  <Input
                    className={styles.formInput}
                    type='digit'
                    placeholder='5'
                    value={formData.rating}
                    onInput={(e) => updateForm('rating', e.detail.value)}
                  />
                  <Text className={styles.ratingStars}>
                    {'★'.repeat(Math.min(5, Math.round(parseFloat(formData.rating) || 0)))}
                    {'☆'.repeat(5 - Math.min(5, Math.round(parseFloat(formData.rating) || 0)))}
                  </Text>
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>图片链接</Text>
                <Input
                  className={styles.formInput}
                  placeholder='https://... （选填）'
                  value={formData.image}
                  onInput={(e) => updateForm('image', e.detail.value)}
                />
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <View className={styles.btnCancel} onClick={() => setShowModal(false)}>
                <Text className={styles.btnCancelText}>取消</Text>
              </View>
              <View className={styles.btnSubmit} onClick={handleSubmit}>
                <Text className={styles.btnSubmitText}>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default DestinationPage
