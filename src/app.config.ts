export default defineAppConfig({
  pages: [
    'pages/destination/index',
    'pages/itinerary/index',
    'pages/expense/index',
    'pages/checklist/index',
    'pages/journal/index',
    'pages/place-detail/index',
    'pages/itinerary-detail/index',
    'pages/add-expense/index',
    'pages/add-journal/index',
    'pages/trip-summary/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ff7a45',
    navigationBarTitleText: '旅行助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#fff8f5'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff7a45',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/destination/index',
        text: '目的地'
      },
      {
        pagePath: 'pages/itinerary/index',
        text: '行程表'
      },
      {
        pagePath: 'pages/expense/index',
        text: '费用'
      },
      {
        pagePath: 'pages/checklist/index',
        text: '清单'
      },
      {
        pagePath: 'pages/journal/index',
        text: '旅途记录'
      }
    ]
  }
})
