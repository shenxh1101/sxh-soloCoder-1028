import type { ItineraryItem } from '@/types/travel'

export const mockItineraries: ItineraryItem[] = [
  {
    id: 'itinerary-1',
    title: '参观故宫博物院',
    description: '建议提前网上购票，早上人少',
    date: '2024-06-15',
    timeSlot: 'morning',
    startTime: '09:00',
    endTime: '12:00',
    location: '北京市东城区景山前街4号',
    placeId: 'place-1',
    hasConflict: false,
    order: 0
  },
  {
    id: 'itinerary-2',
    title: '午餐：全聚德烤鸭',
    description: '前门总店，需提前预约',
    date: '2024-06-15',
    timeSlot: 'afternoon',
    startTime: '12:30',
    endTime: '14:00',
    location: '北京市东城区前门大街30号',
    placeId: 'place-7',
    hasConflict: false,
    order: 0
  },
  {
    id: 'itinerary-3',
    title: '登长城',
    description: '八达岭长城，建议穿舒适的鞋',
    date: '2024-06-15',
    timeSlot: 'afternoon',
    startTime: '14:30',
    endTime: '17:00',
    location: '北京市延庆区八达岭镇',
    placeId: 'place-10',
    hasConflict: false,
    order: 1
  },
  {
    id: 'itinerary-4',
    title: '夜游王府井',
    description: '品尝小吃，逛街购物',
    date: '2024-06-15',
    timeSlot: 'evening',
    startTime: '19:00',
    endTime: '21:30',
    location: '北京市东城区王府井',
    hasConflict: false,
    order: 0
  },
  {
    id: 'itinerary-5',
    title: '早餐',
    date: '2024-06-16',
    timeSlot: 'morning',
    startTime: '07:30',
    endTime: '08:30',
    location: '酒店自助餐厅',
    hasConflict: false,
    order: 0
  },
  {
    id: 'itinerary-6',
    title: '颐和园游览',
    description: '中国古典园林的代表作',
    date: '2024-06-16',
    timeSlot: 'morning',
    startTime: '09:00',
    endTime: '12:00',
    location: '北京市海淀区新建宫门路19号',
    hasConflict: false,
    order: 1
  },
  {
    id: 'itinerary-7',
    title: '天坛公园',
    description: '明清皇帝祭天场所',
    date: '2024-06-16',
    timeSlot: 'afternoon',
    startTime: '13:00',
    endTime: '15:30',
    location: '北京市东城区天坛东里1号',
    hasConflict: false,
    order: 0
  },
  {
    id: 'itinerary-8',
    title: '返回上海',
    date: '2024-06-16',
    timeSlot: 'afternoon',
    startTime: '17:00',
    endTime: '19:30',
    location: '北京南站',
    placeId: 'place-8',
    hasConflict: true,
    order: 1
  }
]
