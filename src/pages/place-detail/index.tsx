import React, { useState } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import type { Place, PlaceCategory } from '@/types/travel'

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

const PlaceDetailPage: React.FC = () => {
  const router = useRouter()
  const placeId = router.params.id

  const { places, updatePlace, removePlace, setPlaceCategory } = useTravelStore()

  const place = places.find((p) => p.id === placeId)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    category: place?.category || 'attraction',
    name: place?.name || '',
    address: place?.address || '',
    description: place?.description || '',
    rating: place?.rating?.toString() || '5',
    image: place?.image || ''
  })

  if (!place) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📍</Text>
          <Text className={styles.emptyTitle}>找不到该地点</Text>
          <Text className={styles.emptyDesc}>可能已被删除</Text>
        </View>
      </View>
    )
  }

  const config = categories.find((c) => c.key === place.category) || categories[0]
  const color = categoryColors[place.category]

  const handleEdit = () => {
    setFormData({
      category: place.category,
      name: place.name,
      address: place.address,
      description: place.description,
      rating: place.rating?.toString() || '5',
      image: place.image
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
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
    
    updatePlace(place.id, {
      category: newCategory,
      name: formData.name.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
      rating: isNaN(ratingNum) ? 5 : Math.min(5, Math.max(1, ratingNum)),
      image: formData.image.trim() || getDefaultImage(newCategory)
    })
    
    setPlaceCategory(newCategory)

    Taro.showToast({ title: '保存成功', icon: 'success' })
    setIsEditing(false)
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个地点吗？此操作不可恢复。',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          removePlace(place.id)
          Taro.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        }
      }
    })
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

  const displayPlace = isEditing ? formData : place
  const displayRating = isEditing ? parseFloat(formData.rating) || 0 : (place.rating || 0)

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollContainer}>
        <Image
          className={styles.coverImage}
          src={isEditing ? (formData.image || getDefaultImage(formData.category)) : place.image}
          mode='aspectFill'
        />

        <View className={styles.content}>
          {!isEditing ? (
            <>
              <View className={styles.header}>
                <View
                  className={styles.categoryTag}
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Text>{config.icon} {config.label}</Text>
                </View>
                <Text className={styles.title}>{place.name}</Text>
                {place.rating && (
                  <View className={styles.rating}>
                    <Text className={styles.star}>★</Text>
                    <Text className={styles.ratingValue}>{place.rating}</Text>
                    <Text className={styles.ratingMax}>/5</Text>
                  </View>
                )}
              </View>

              <View className={styles.infoSection}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoIcon}>📍</Text>
                  <Text className={styles.infoText}>{place.address}</Text>
                </View>
              </View>

              <View className={styles.section}>
                <Text className={styles.sectionTitle}>简介</Text>
                <Text className={styles.description}>
                  {place.description || '暂无简介'}
                </Text>
              </View>

              <View className={styles.metaSection}>
                <Text className={styles.metaText}>
                  添加时间：{new Date(place.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            </>
          ) : (
            <>
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
                  placeholder='请输入名称'
                  value={formData.name}
                  onInput={(e) => updateForm('name', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>地址 <Text className={styles.required}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入地址'
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

              {(formData.image || getDefaultImage(formData.category)) && (
                <View className={styles.previewSection}>
                  <Text className={styles.formLabel}>图片预览</Text>
                  <Image
                    className={styles.previewImage}
                    src={formData.image || getDefaultImage(formData.category)}
                    mode='aspectFill'
                  />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View className={styles.footer}>
        {!isEditing ? (
          <>
            <View className={styles.btnSecondary} onClick={handleEdit}>
              <Text className={styles.btnSecondaryText}>编辑</Text>
            </View>
            <View className={styles.btnDanger} onClick={handleDelete}>
              <Text className={styles.btnDangerText}>删除</Text>
            </View>
          </>
        ) : (
          <>
            <View className={styles.btnSecondary} onClick={handleCancel}>
              <Text className={styles.btnSecondaryText}>取消</Text>
            </View>
            <View className={styles.btnPrimary} onClick={handleSave}>
              <Text className={styles.btnPrimaryText}>保存</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

export default PlaceDetailPage
