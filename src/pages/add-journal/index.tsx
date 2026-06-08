import React, { useState } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useTravelStore } from '@/store/travelStore'
import type { Place } from '@/types/travel'

interface FormData {
  date: string
  title: string
  content: string
  location: string
  rating: string
  images: string[]
  weather: string
  mood: string
}

const weatherOptions = ['☀️ 晴天', '⛅ 多云', '🌧️ 雨天', '❄️ 雪天', '🌫️ 雾霾']
const moodOptions = ['😊 开心', '😌 平静', '😴 疲惫', '🤩 兴奋', '😢 失落']

const AddJournalPage: React.FC = () => {
  const { addJournal, places } = useTravelStore()

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    location: '',
    rating: '5',
    images: [],
    weather: '',
    mood: ''
  })

  const [newImageUrl, setNewImageUrl] = useState('')
  const [showPlacePicker, setShowPlacePicker] = useState(false)

  const updateForm = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return
    updateForm('images', [...formData.images, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    updateForm('images', formData.images.filter((_, i) => i !== index))
  }

  const handleSelectPlace = (place: Place) => {
    updateForm('location', place.name)
    setShowPlacePicker(false)
  }

  const handleSelectFromPlaces = () => {
    if (places.length === 0) {
      Taro.showToast({ title: '还没有收藏的地点', icon: 'none' })
      return
    }
    setShowPlacePicker(!showPlacePicker)
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!formData.content.trim()) {
      Taro.showToast({ title: '请记录一些内容', icon: 'none' })
      return
    }

    const ratingNum = parseFloat(formData.rating)
    addJournal({
      date: formData.date,
      title: formData.title.trim(),
      content: formData.content.trim(),
      location: formData.location.trim() || undefined,
      rating: isNaN(ratingNum) ? 5 : Math.min(5, Math.max(1, ratingNum)),
      images: formData.images,
      weather: formData.weather || undefined,
      mood: formData.mood || undefined
    })

    Taro.showToast({ title: '记录成功', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
  }

  const ratingNum = parseFloat(formData.rating) || 0

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.scrollContainer}>
        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>日期</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='YYYY-MM-DD'
            value={formData.date}
            onInput={(e) => updateForm('date', e.detail.value)}
          />
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>标题 <Text className={styles.required}>*</Text></Text>
          <Input
            className={styles.formInput}
            placeholder='给今天起个标题吧'
            value={formData.title}
            onInput={(e) => updateForm('title', e.detail.value)}
          />
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>记录 <Text className={styles.required}>*</Text></Text>
          <Input
            className={styles.formTextarea}
            placeholder='记录今天的旅行故事...'
            value={formData.content}
            onInput={(e) => updateForm('content', e.detail.value)}
          />
        </View>

        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>地点</Text>
            <Text className={styles.sectionAction} onClick={handleSelectFromPlaces}>
              {showPlacePicker ? '收起' : '从收藏中选择'}
            </Text>
          </View>
          {showPlacePicker && (
            <ScrollView className={styles.placePicker} scrollX showScrollbar={false}>
              {places.map((place) => (
                <View
                  key={place.id}
                  className={styles.placeOption}
                  onClick={() => handleSelectPlace(place)}
                >
                  <Image className={styles.placeImage} src={place.image} mode='aspectFill' />
                  <Text className={styles.placeName}>{place.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}
          <Input
            className={styles.formInput}
            placeholder='或手动输入地点名称'
            value={formData.location}
            onInput={(e) => updateForm('location', e.detail.value)}
          />
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>评分</Text>
          <View className={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <View
                key={star}
                className={styles.starBtn}
                onClick={() => updateForm('rating', String(star))}
              >
                <Text className={classnames(
                  styles.starIcon,
                  ratingNum >= star && styles.starFilled
                )}>
                  ★
                </Text>
              </View>
            ))}
            <Text className={styles.ratingValue}>{ratingNum.toFixed(1)}</Text>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>天气</Text>
          <ScrollView className={styles.optionScroll} scrollX showScrollbar={false}>
            {weatherOptions.map((weather) => (
              <View
                key={weather}
                className={classnames(
                  styles.optionTag,
                  formData.weather === weather && styles.optionTagActive
                )}
                onClick={() => updateForm('weather', formData.weather === weather ? '' : weather)}
              >
                <Text className={styles.optionText}>{weather}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>心情</Text>
          <ScrollView className={styles.optionScroll} scrollX showScrollbar={false}>
            {moodOptions.map((mood) => (
              <View
                key={mood}
                className={classnames(
                  styles.optionTag,
                  formData.mood === mood && styles.optionTagActive
                )}
                onClick={() => updateForm('mood', formData.mood === mood ? '' : mood)}
              >
                <Text className={styles.optionText}>{mood}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>照片</Text>
          {formData.images.length > 0 && (
            <ScrollView className={styles.imageList} scrollX showScrollbar={false}>
              {formData.images.map((img, index) => (
                <View key={index} className={styles.imageItem}>
                  <Image className={styles.imagePreview} src={img} mode='aspectFill' />
                  <View className={styles.imageRemove} onClick={() => handleRemoveImage(index)}>
                    <Text className={styles.imageRemoveIcon}>×</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          <View className={styles.addImageRow}>
            <Input
              className={styles.imageInput}
              placeholder='粘贴图片链接 https://...'
              value={newImageUrl}
              onInput={(e) => setNewImageUrl(e.detail.value)}
            />
            <View className={styles.addImageBtn} onClick={handleAddImage}>
              <Text className={styles.addImageBtnText}>添加</Text>
            </View>
          </View>
          <Text className={styles.imageHint}>可以添加多张照片，记录美好瞬间</Text>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.btnCancel} onClick={() => Taro.navigateBack()}>
          <Text className={styles.btnCancelText}>取消</Text>
        </View>
        <View className={styles.btnSubmit} onClick={handleSubmit}>
          <Text className={styles.btnSubmitText}>保存记录</Text>
        </View>
      </View>
    </View>
  )
}

export default AddJournalPage
