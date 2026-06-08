import type { JournalEntry } from '@/types/travel'

export const mockJournals: JournalEntry[] = [
  {
    id: 'journal-1',
    date: '2024-06-15',
    title: '第一天：北京初印象',
    content: '今天终于来到了心心念念的北京！早上参观了故宫，真的太震撼了。红墙黄瓦，每一处都透着历史的厚重感。下午去了长城，虽然很累，但站在长城上远眺的那一刻，感觉一切都值得。晚上在王府井吃了各种小吃，很开心的一天！',
    images: [
      'https://picsum.photos/id/1018/750/500',
      'https://picsum.photos/id/1082/750/500',
      'https://picsum.photos/id/1036/750/500'
    ],
    location: '北京市',
    rating: 5,
    latitude: 39.9042,
    longitude: 116.4074,
    weather: '晴',
    mood: '兴奋'
  },
  {
    id: 'journal-2',
    date: '2024-06-16',
    title: '第二天：园林艺术之美',
    content: '今天游览了颐和园和天坛。颐和园的昆明湖太美了，长廊上的彩绘也很精美。天坛的回音壁真的很神奇，古代工匠的智慧令人赞叹。下午就回上海了，虽然只有两天，但感觉收获满满。',
    images: [
      'https://picsum.photos/id/1039/750/500',
      'https://picsum.photos/id/1044/750/500'
    ],
    location: '北京市',
    rating: 4,
    latitude: 39.9999,
    longitude: 116.2755,
    weather: '多云',
    mood: '满足'
  },
  {
    id: 'journal-3',
    date: '2024-06-18',
    title: '上海慢生活',
    content: '今天在上海外滩散步，看着对岸的陆家嘴天际线，感受这座城市的活力。中午去了南翔吃小笼包，皮薄馅大，汤汁鲜美，名不虚传。',
    images: [
      'https://picsum.photos/id/1036/750/500',
      'https://picsum.photos/id/292/750/500'
    ],
    location: '上海市',
    rating: 4,
    latitude: 31.2304,
    longitude: 121.4737,
    weather: '阴',
    mood: '惬意'
  }
]
