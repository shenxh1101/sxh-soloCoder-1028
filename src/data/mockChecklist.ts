import type { ChecklistItem } from '@/types/travel'

export const mockChecklist: ChecklistItem[] = [
  {
    id: 'checklist-1',
    name: '身份证',
    category: 'documents',
    checked: true,
    quantity: 1
  },
  {
    id: 'checklist-2',
    name: '护照',
    category: 'documents',
    checked: true,
    quantity: 1
  },
  {
    id: 'checklist-3',
    name: '火车票',
    category: 'documents',
    checked: false,
    quantity: 2
  },
  {
    id: 'checklist-4',
    name: '酒店预订确认单',
    category: 'documents',
    checked: false,
    note: '打印电子版也可'
  },
  {
    id: 'checklist-5',
    name: 'T恤',
    category: 'clothing',
    checked: true,
    quantity: 5
  },
  {
    id: 'checklist-6',
    name: '牛仔裤',
    category: 'clothing',
    checked: true,
    quantity: 2
  },
  {
    id: 'checklist-7',
    name: '外套',
    category: 'clothing',
    checked: false,
    quantity: 1,
    note: '早晚温差大'
  },
  {
    id: 'checklist-8',
    name: '内衣袜子',
    category: 'clothing',
    checked: true,
    quantity: 7
  },
  {
    id: 'checklist-9',
    name: '舒适运动鞋',
    category: 'clothing',
    checked: true,
    quantity: 1
  },
  {
    id: 'checklist-10',
    name: '感冒药',
    category: 'medicine',
    checked: true,
    quantity: 1
  },
  {
    id: 'checklist-11',
    name: '肠胃药',
    category: 'medicine',
    checked: false,
    note: '防止水土不服'
  },
  {
    id: 'checklist-12',
    name: '创可贴',
    category: 'medicine',
    checked: true,
    quantity: 10
  },
  {
    id: 'checklist-13',
    name: '充电宝',
    category: 'electronics',
    checked: true,
    quantity: 1,
    note: '20000mAh以内'
  },
  {
    id: 'checklist-14',
    name: '充电器',
    category: 'electronics',
    checked: true,
    quantity: 2
  },
  {
    id: 'checklist-15',
    name: '耳机',
    category: 'electronics',
    checked: false,
    quantity: 1
  },
  {
    id: 'checklist-16',
    name: '相机',
    category: 'electronics',
    checked: false,
    note: '备用电池别忘了'
  },
  {
    id: 'checklist-17',
    name: '雨伞',
    category: 'other',
    checked: true,
    quantity: 1
  },
  {
    id: 'checklist-18',
    name: '防晒霜',
    category: 'other',
    checked: false,
    note: 'SPF50+'
  }
]
